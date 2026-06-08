const mongoose = require('mongoose');

const weaknessAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weakSubjects: [{ name: String, score: Number, recommendation: String }],
  strongSubjects: [{ name: String, score: Number }],
  recommendedStudyTime: [{ subject: String, hours: Number }],
  internalMarks: [{ subject: String, marks: Number, maxMarks: Number }],
  sourceFile: String
}, { timestamps: true });

module.exports = mongoose.model('WeaknessAnalysis', weaknessAnalysisSchema);
