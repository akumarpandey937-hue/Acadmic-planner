const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/cgpa', require('./cgpa'));
router.use('/study-plans', require('./studyPlan'));
router.use('/attendance', require('./attendance'));
router.use('/backlogs', require('./backlog'));
router.use('/placement', require('./placement'));
router.use('/notes', require('./notes'));
router.use('/weakness', require('./weakness'));
router.use('/analytics', require('./analytics'));
router.use('/gamification', require('./gamification'));
router.use('/productivity', require('./productivity'));
router.use('/admin', require('./admin'));
router.use('/notifications', require('./notifications'));
router.use('/contact', require('./contact'));
router.use('/public', require('./public'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'AcademicOS API is running', version: '1.0.0' });
});

module.exports = router;
