const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  title: { type: String, required: true },
  description: String,
  target: { type: Number, required: true },
  progress: { type: Number, default: 0 },
  xpReward: { type: Number, default: 25 },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  expiresAt: { type: Date, required: true },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
