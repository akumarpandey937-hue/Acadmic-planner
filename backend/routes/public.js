const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CGPAData = require('../models/CGPAData');
const StudySession = require('../models/StudySession');

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, avgCGPA, totalSessions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      CGPAData.aggregate([{ $group: { _id: null, avg: { $avg: '$currentCGPA' } } }]),
      StudySession.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        averageCGPA: avgCGPA[0]?.avg ? Math.round(avgCGPA[0].avg * 100) / 100 : null,
        totalStudySessions: totalSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
