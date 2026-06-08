const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notifications = require('../controllers/notificationController');

router.get('/', protect, notifications.getAll);
router.get('/unread', protect, notifications.getUnreadCount);
router.patch('/:id/read', protect, notifications.markRead);
router.patch('/read-all', protect, notifications.markAllRead);

module.exports = router;
