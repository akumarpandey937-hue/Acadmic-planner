const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user.id }, { isGlobal: true }]
  }).sort('-createdAt').limit(50);
  res.json({ success: true, data: notifications });
};

exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Marked as read' });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'All marked as read' });
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [{ user: req.user.id }, { isGlobal: true }],
    isRead: false
  });
  res.json({ success: true, data: { count } });
};
