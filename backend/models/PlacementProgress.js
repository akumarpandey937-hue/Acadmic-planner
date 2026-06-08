const mongoose = require('mongoose');

const placementProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dsaProblemsSolved: { type: Number, default: 0 },
  dsaTarget: { type: Number, default: 300 },
  projectsBuilt: { type: Number, default: 0 },
  projectsTarget: { type: Number, default: 5 },
  aptitudeScore: { type: Number, default: 0, min: 0, max: 100 },
  communicationScore: { type: Number, default: 0, min: 0, max: 100 },
  readinessScore: { type: Number, default: 0, min: 0, max: 100 },
  suggestions: [String],
  history: [{
    date: { type: Date, default: Date.now },
    dsaProblemsSolved: Number,
    projectsBuilt: Number,
    aptitudeScore: Number,
    communicationScore: Number,
    readinessScore: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('PlacementProgress', placementProgressSchema);
