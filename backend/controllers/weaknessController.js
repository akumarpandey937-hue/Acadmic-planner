const WeaknessAnalysis = require('../models/WeaknessAnalysis');
const { analyzeWeakness, extractTextFromPDF } = require('../services/aiService');
const User = require('../models/User');

exports.analyze = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let marks = req.body.internalMarks;

    if (req.file) {
      const text = await extractTextFromPDF(req.file.path);
      marks = marks || [{ subject: 'Extracted Subject', marks: 65, maxMarks: 100 }];
    }

    if (!marks || !marks.length) {
      return res.status(400).json({ success: false, message: 'Internal marks required' });
    }

    if (user.aiCredits < 1) {
      return res.status(403).json({ success: false, message: 'Insufficient AI credits' });
    }

    const analysis = await analyzeWeakness(marks);

    const record = await WeaknessAnalysis.create({
      user: req.user.id,
      ...analysis,
      internalMarks: marks,
      sourceFile: req.file?.filename
    });

    user.aiCredits -= 1;
    await user.save();

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  const data = await WeaknessAnalysis.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data });
};
