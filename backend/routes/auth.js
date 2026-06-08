const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/security');
const auth = require('../controllers/authController');

router.post('/register', authLimiter, auth.registerValidation, validate, auth.register);
router.post('/login', authLimiter, auth.loginValidation, validate, auth.login);
router.post('/logout', auth.logout);
router.get('/me', protect, auth.getMe);
router.get('/verify-email/:token', auth.verifyEmail);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.put('/reset-password/:token', auth.resetPassword);

module.exports = router;
