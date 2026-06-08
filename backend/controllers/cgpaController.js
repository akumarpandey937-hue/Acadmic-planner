const CGPAData = require('../models/CGPAData');
const {
  calculateRequiredSGPA,
  calculateDifficultyScore,
  generateSemesterPlan
} = require('../utils/calculators');

exports.predict = async (req, res) => {
  try {
    const { currentCGPA, targetCGPA, remainingSemesters } = req.body;
    const completedSemesters = req.user.semester - 1 || 4;

    const requiredSGPA = calculateRequiredSGPA(
      currentCGPA, targetCGPA, completedSemesters, remainingSemesters
    );
    const difficultyScore = calculateDifficultyScore(requiredSGPA);
    const semesterPlan = generateSemesterPlan(
      currentCGPA, targetCGPA, remainingSemesters, completedSemesters
    );

    const data = await CGPAData.create({
      user: req.user.id,
      currentCGPA,
      targetCGPA,
      remainingSemesters,
      requiredSGPA,
      difficultyScore,
      semesterPlan
    });

    res.json({
      success: true,
      data: {
        requiredSGPA,
        difficultyScore,
        semesterPlan,
        id: data._id,
        feasible: requiredSGPA <= 10
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  const data = await CGPAData.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data });
};

exports.addSemesterResult = async (req, res) => {
  try {
    const latest = await CGPAData.findOne({ user: req.user.id }).sort('-createdAt');
    if (!latest) {
      return res.status(404).json({ success: false, message: 'No CGPA data found' });
    }

    latest.history.push(req.body);
    if (req.body.cgpa) latest.currentCGPA = req.body.cgpa;
    await latest.save();

    res.json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
