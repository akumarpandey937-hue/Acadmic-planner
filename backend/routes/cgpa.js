const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cgpa = require('../controllers/cgpaController');

router.post('/predict', protect, cgpa.predict);
router.get('/history', protect, cgpa.getHistory);
router.post('/semester-result', protect, cgpa.addSemesterResult);

module.exports = router;
