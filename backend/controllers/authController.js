const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse } = require('../middleware/auth');
const { sendEmail, verificationEmail, resetPasswordEmail } = require('../utils/email');
const { unlockBadge } = require('../utils/gamification');
const config = require('../config/env');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('college').trim().notEmpty().withMessage('College is required'),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
  body('semester').isInt({ min: 1, max: 12 }).withMessage('Valid semester required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.register = async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create(req.body);
    const token = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      const emailContent = verificationEmail(user.name, token);
      await sendEmail({ to: user.email, ...emailContent });
    } catch (emailErr) {
      console.warn('Verification email failed:', emailErr.message);
    }

    sendTokenResponse(user, 201, res);
    await unlockBadge(user._id, 'first_login');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    user.lastLogin = new Date();
    user.rememberMe = !!rememberMe;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, rememberMe);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('achievements');
  res.json({ success: true, data: user });
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const token = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      const emailContent = resetPasswordEmail(user.name, token);
      await sendEmail({ to: user.email, ...emailContent });
    } catch (emailErr) {
      console.warn('Reset email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedAdmin = async () => {
  if (!config.adminEmail) return;
  const exists = await User.findOne({ email: config.adminEmail });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: config.adminEmail,
      phone: '0000000000',
      college: 'AcademicOS',
      university: 'AcademicOS',
      branch: 'Admin',
      semester: 1,
      password: config.adminPassword || 'Admin@123456',
      role: 'admin',
      isEmailVerified: true
    });
    console.log('Admin user seeded');
  }
};
