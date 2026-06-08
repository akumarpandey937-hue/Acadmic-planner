const mongoose = require('mongoose');

const backlogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: [{
    name: { type: String, required: true },
    examDate: { type: Date, required: true },
    priority: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'in-progress', 'cleared'], default: 'pending' },
    studyHours: { type: Number, default: 0 },
    topics: [String]
  }],
  recoveryRoadmap: [{
    week: Number,
    subject: String,
    tasks: [String],
    hours: Number,
    completed: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Backlog', backlogSchema);
