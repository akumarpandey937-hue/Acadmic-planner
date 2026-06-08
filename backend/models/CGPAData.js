const mongoose = require('mongoose');

const cgpaDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentCGPA: { type: Number, required: true, min: 0, max: 10 },
  targetCGPA: { type: Number, min: 0, max: 10 },
  remainingSemesters: { type: Number, min: 0 },
  requiredSGPA: Number,
  difficultyScore: { type: Number, min: 0, max: 100 },
  semesterPlan: [{
    semester: Number,
    targetSGPA: Number,
    subjects: [{ name: String, targetGrade: String, credits: Number }]
  }],
  history: [{
    semester: Number,
    sgpa: Number,
    cgpa: Number,
    subjects: [{ name: String, grade: String, credits: Number, marks: Number }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('CGPAData', cgpaDataSchema);
