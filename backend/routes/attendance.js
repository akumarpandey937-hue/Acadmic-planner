const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const attendance = require('../controllers/attendanceController');

router.post('/', protect, attendance.createOrUpdate);
router.get('/', protect, attendance.getAll);
router.post('/predict', protect, attendance.predict);

module.exports = router;
