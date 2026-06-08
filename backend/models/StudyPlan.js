const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Study Plan' },
  subjects: [{ name: String, priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' } }],
  examDate: { type: Date, required: true },
  availableHours: { type: Number, required: true },
  dailySchedule: [{
    day: Number,
    date: Date,
    tasks: [{ subject: String, topic: String, duration: Number, completed: { type: Boolean, default: false } }]
  }],
  weeklySchedule: [{
    week: Number,
    focus: String,
    subjects: [String],
    hours: Number
  }],
  revisionPlan: [{
    phase: String,
    startDate: Date,
    endDate: Date,
    subjects: [String],
    topics: [String]
  }],
  aiGenerated: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
