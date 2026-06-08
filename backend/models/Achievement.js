const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  icon: { type: String, default: '🏆' },
  xpReward: { type: Number, default: 0 },
  category: { type: String, enum: ['study', 'streak', 'cgpa', 'placement', 'challenge', 'special'], default: 'study' },
  unlockedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
