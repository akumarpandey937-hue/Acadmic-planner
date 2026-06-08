const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '📚' },
  targetDays: { type: Number, default: 7 },
  streak: { type: Number, default: 0 },
  completions: [{
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
