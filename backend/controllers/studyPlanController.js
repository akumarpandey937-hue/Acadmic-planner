const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../services/aiService');
const { addXP } = require('../utils/gamification');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const { subjects, examDate, availableHours, title } = req.body;
    const user = await User.findById(req.user.id);

    if (user.aiCredits < 1) {
      return res.status(403).json({ success: false, message: 'Insufficient AI credits' });
    }

    const plan = await generateStudyPlan(subjects, examDate, availableHours);

    const studyPlan = await StudyPlan.create({
      user: req.user.id,
      title: title || 'AI Study Plan',
      subjects: subjects.map(s => ({ name: s })),
      examDate,
      availableHours,
      dailySchedule: plan.dailySchedule,
      weeklySchedule: plan.weeklySchedule,
      revisionPlan: plan.revisionPlan,
      aiGenerated: true
    });

    user.aiCredits -= 1;
    await user.save();
    await addXP(req.user.id, 15);

    res.status(201).json({ success: true, data: studyPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data: plans });
};

exports.getOne = async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, data: plan });
};

exports.updateTaskStatus = async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

  const { dayIndex, taskIndex, completed } = req.body;
  if (plan.dailySchedule[dayIndex]?.tasks[taskIndex]) {
    plan.dailySchedule[dayIndex].tasks[taskIndex].completed = completed;
    await plan.save();
    if (completed) await addXP(req.user.id, 5);
  }

  res.json({ success: true, data: plan });
};

exports.delete = async (req, res) => {
  await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Plan deleted' });
};
