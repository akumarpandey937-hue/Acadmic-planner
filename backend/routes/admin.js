const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/users', admin.getUsers);
router.delete('/users/:id', admin.deleteUser);
router.get('/reports', admin.getReports);
router.put('/reports/:id', admin.updateReport);
router.get('/analytics', admin.getAnalytics);
router.post('/notifications', admin.sendNotification);
router.post('/ai-credits', admin.manageAICredits);

module.exports = router;
