const StudySession = require('../models/StudySession');
const Attendance = require('../models/Attendance');
const CGPAData = require('../models/CGPAData');
const WeaknessAnalysis = require('../models/WeaknessAnalysis');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await StudySession.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    }).sort('date');

    const studyHoursByDay = {};
    sessions.forEach(s => {
      const key = s.date.toISOString().split('T')[0];
      studyHoursByDay[key] = (studyHoursByDay[key] || 0) + s.duration / 60;
    });

    const attendance = await Attendance.find({ user: userId });
    const cgpaData = await CGPAData.find({ user: userId }).sort('createdAt');
    const weakness = await WeaknessAnalysis.findOne({ user: userId }).sort('-createdAt');

    const subjectPerformance = weakness
      ? [...(weakness.strongSubjects || []), ...(weakness.weakSubjects || [])]
      : [];

    res.json({
      success: true,
      data: {
        studyHours: {
          labels: Object.keys(studyHoursByDay),
          values: Object.values(studyHoursByDay)
        },
        attendance: {
          labels: attendance.map(a => a.subject),
          values: attendance.map(a =>
            a.totalClasses ? Math.round((a.presentClasses / a.totalClasses) * 100) : 0
          )
        },
        cgpaProgress: {
          labels: cgpaData.map((_, i) => `Record ${i + 1}`),
          values: cgpaData.map(c => c.currentCGPA)
        },
        subjectPerformance: {
          labels: subjectPerformance.map(s => s.name),
          values: subjectPerformance.map(s => s.score)
        },
        totalStudyHours: sessions.reduce((sum, s) => sum + s.duration, 0) / 60
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.predictExam = async (req, res) => {
  const { predictExamScore } = require('../utils/calculators');
  const { internalMarks, attendance, assignments } = req.body;
  const predicted = predictExamScore(internalMarks, attendance, assignments);
  res.json({ success: true, data: { predicted, grade: predicted >= 90 ? 'A+' : predicted >= 80 ? 'A' : predicted >= 70 ? 'B+' : 'B' } });
};
