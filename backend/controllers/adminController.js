const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const StudySession = require('../models/StudySession');
const CGPAData = require('../models/CGPAData');

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

  user.isActive = false;
  await user.save();

  res.json({ success: true, message: 'User deactivated' });
};

exports.getReports = async (req, res) => {
  const reports = await Report.find()
    .populate('user', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: reports });
};

exports.updateReport = async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
    adminNotes: req.body.adminNotes,
    reviewedBy: req.user.id
  }, { new: true });
  res.json({ success: true, data: report });
};

exports.getAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'student' });
  const activeUsers = await User.countDocuments({ role: 'student', isActive: true });
  const totalSessions = await StudySession.countDocuments();
  const avgCGPA = await CGPAData.aggregate([
    { $group: { _id: null, avg: { $avg: '$currentCGPA' } } }
  ]);

  const recentUsers = await User.find({ role: 'student' })
    .select('name email createdAt')
    .sort('-createdAt')
    .limit(10);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalSessions,
      averageCGPA: avgCGPA[0]?.avg?.toFixed(2) || 0,
      recentUsers
    }
  });
};

exports.sendNotification = async (req, res) => {
  const { title, message, type, userId, isGlobal } = req.body;

  if (isGlobal) {
    const users = await User.find({ isActive: true }).select('_id');
    const notifications = users.map(u => ({
      user: u._id,
      title,
      message,
      type: type || 'info',
      isGlobal: true,
      sentBy: req.user.id
    }));
    await Notification.insertMany(notifications);
  } else {
    await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'info',
      sentBy: req.user.id
    });
  }

  res.json({ success: true, message: 'Notification sent' });
};

exports.manageAICredits = async (req, res) => {
  const { userId, credits, action } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (action === 'set') user.aiCredits = credits;
  else if (action === 'add') user.aiCredits += credits;
  else if (action === 'subtract') user.aiCredits = Math.max(0, user.aiCredits - credits);

  await user.save();
  res.json({ success: true, data: { userId: user._id, aiCredits: user.aiCredits } });
};

exports.createReport = async (req, res) => {
  const report = await Report.create({ user: req.user.id, ...req.body });
  res.status(201).json({ success: true, data: report });
};
