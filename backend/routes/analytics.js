const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const analytics = require('../controllers/analyticsController');

router.get('/dashboard', protect, analytics.getDashboard);
router.post('/predict-exam', protect, analytics.predictExam);

module.exports = router;
