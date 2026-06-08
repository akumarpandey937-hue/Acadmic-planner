const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Challenge = require('../models/Challenge');
const { addXP, unlockBadge } = require('../utils/gamification');

const DAILY_CHALLENGES = [
  { title: 'Study 2 Hours', target: 120, xpReward: 25 },
  { title: 'Complete 3 Tasks', target: 3, xpReward: 20 },
  { title: 'Pomodoro Session', target: 1, xpReward: 15 }
];

const WEEKLY_CHALLENGES = [
  { title: 'Study 15 Hours', target: 900, xpReward: 100 },
  { title: 'Solve 10 DSA Problems', target: 10, xpReward: 75 },
  { title: 'Maintain 5-Day Streak', target: 5, xpReward: 80 }
];

exports.getLeaderboard = async (req, res) => {
  const users = await User.find({ role: 'student', isActive: true })
    .select('name xp level studyStreak college branch')
    .sort('-xp')
    .limit(50);
  res.json({ success: true, data: users });
};

exports.getAchievements = async (req, res) => {
  const achievements = await Achievement.find({ user: req.user.id }).sort('-unlockedAt');
  res.json({ success: true, data: achievements });
};

exports.getChallenges = async (req, res) => {
  let challenges = await Challenge.find({
    user: req.user.id,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });

  if (!challenges.length) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const newChallenges = [
      ...DAILY_CHALLENGES.map(c => ({
        user: req.user.id,
        type: 'daily',
        ...c,
        expiresAt: tomorrow
      })),
      ...WEEKLY_CHALLENGES.map(c => ({
        user: req.user.id,
        type: 'weekly',
        ...c,
        expiresAt: nextWeek
      }))
    ];

    challenges = await Challenge.insertMany(newChallenges);
  }

  res.json({ success: true, data: challenges });
};

exports.updateChallengeProgress = async (req, res) => {
  const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user.id });
  if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

  challenge.progress = Math.min(challenge.progress + (req.body.increment || 1), challenge.target);

  if (challenge.progress >= challenge.target && challenge.status === 'active') {
    challenge.status = 'completed';
    challenge.completedAt = new Date();
    await addXP(req.user.id, challenge.xpReward);
    await unlockBadge(req.user.id, 'challenge_complete');
  }

  await challenge.save();
  res.json({ success: true, data: challenge });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).populate('achievements');
  res.json({
    success: true,
    data: {
      xp: user.xp,
      level: user.level,
      studyStreak: user.studyStreak,
      achievements: user.achievements,
      nextLevelXP: user.level * 100
    }
  });
};
