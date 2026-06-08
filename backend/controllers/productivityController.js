const Task = require('../models/Task');
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');
const StudySession = require('../models/StudySession');
const { updateStreak, addXP } = require('../utils/gamification');

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data: tasks });
};

exports.createTask = async (req, res) => {
  const task = await Task.create({ user: req.user.id, ...req.body });
  res.status(201).json({ success: true, data: task });
};

exports.updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  if (task.status === 'done') await addXP(req.user.id, 10);
  res.json({ success: true, data: task });
};

exports.deleteTask = async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Task deleted' });
};

exports.getHabits = async (req, res) => {
  const habits = await Habit.find({ user: req.user.id });
  res.json({ success: true, data: habits });
};

exports.createHabit = async (req, res) => {
  const habit = await Habit.create({ user: req.user.id, ...req.body });
  res.status(201).json({ success: true, data: habit });
};

exports.completeHabit = async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
  if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = habit.completions.find(c => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (!existing) {
    habit.completions.push({ date: today, completed: true });
    habit.streak += 1;
    await habit.save();
    await updateStreak(req.user.id);
    await addXP(req.user.id, 5);
  }

  res.json({ success: true, data: habit });
};

exports.getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data: goals });
};

exports.createGoal = async (req, res) => {
  const goal = await Goal.create({ user: req.user.id, ...req.body });
  res.status(201).json({ success: true, data: goal });
};

exports.updateGoal = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
  if (goal.currentValue >= goal.targetValue) {
    goal.status = 'completed';
    await goal.save();
    await addXP(req.user.id, 25);
  }
  res.json({ success: true, data: goal });
};

exports.logStudySession = async (req, res) => {
  const session = await StudySession.create({ user: req.user.id, ...req.body });
  await updateStreak(req.user.id);
  await addXP(req.user.id, Math.floor(session.duration / 30));
  res.status(201).json({ success: true, data: session });
};

exports.getStudySessions = async (req, res) => {
  const sessions = await StudySession.find({ user: req.user.id }).sort('-date').limit(50);
  res.json({ success: true, data: sessions });
};
