const PlacementProgress = require('../models/PlacementProgress');
const { calculatePlacementReadiness } = require('../utils/calculators');
const { unlockBadge } = require('../utils/gamification');

exports.getOrCreate = async (req, res) => {
  let progress = await PlacementProgress.findOne({ user: req.user.id });
  if (!progress) {
    progress = await PlacementProgress.create({ user: req.user.id });
  }
  res.json({ success: true, data: progress });
};

exports.update = async (req, res) => {
  try {
    let progress = await PlacementProgress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await PlacementProgress.create({ user: req.user.id });
    }

    Object.assign(progress, req.body);
    const { readinessScore, suggestions } = calculatePlacementReadiness(
      progress.dsaProblemsSolved,
      progress.dsaTarget,
      progress.projectsBuilt,
      progress.projectsTarget,
      progress.aptitudeScore,
      progress.communicationScore
    );

    progress.readinessScore = readinessScore;
    progress.suggestions = suggestions;
    progress.history.push({
      dsaProblemsSolved: progress.dsaProblemsSolved,
      projectsBuilt: progress.projectsBuilt,
      aptitudeScore: progress.aptitudeScore,
      communicationScore: progress.communicationScore,
      readinessScore
    });

    await progress.save();

    if (progress.dsaProblemsSolved >= 50) await unlockBadge(req.user.id, 'dsa_50');

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.topperMode = async (req, res) => {
  const { topperGapAnalysis } = require('../utils/calculators');
  const student = req.body.student || {
    cgpa: 7.5, studyHours: 20, dsaSolved: 50, mockTests: 5
  };
  const topper = {
    cgpa: 9.2, studyHours: 40, dsaSolved: 300, mockTests: 25
  };

  const analysis = topperGapAnalysis(student, topper);
  res.json({ success: true, data: { student, topper, analysis } });
};
