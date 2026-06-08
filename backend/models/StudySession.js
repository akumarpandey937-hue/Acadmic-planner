const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  duration: { type: Number, required: true },
  type: { type: String, enum: ['pomodoro', 'focus', 'regular'], default: 'regular' },
  date: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
