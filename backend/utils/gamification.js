const Achievement = require('../models/Achievement');
const User = require('../models/User');

const BADGES = {
  first_login: { name: 'First Steps', icon: '🚀', xp: 10, category: 'special' },
  streak_7: { name: 'Week Warrior', icon: '🔥', xp: 50, category: 'streak' },
  streak_30: { name: 'Monthly Master', icon: '💎', xp: 200, category: 'streak' },
  cgpa_8: { name: 'Honor Roll', icon: '🎓', xp: 100, category: 'cgpa' },
  dsa_50: { name: 'Code Ninja', icon: '💻', xp: 75, category: 'placement' },
  challenge_complete: { name: 'Challenge Champion', icon: '🏅', xp: 30, category: 'challenge' },
  study_100h: { name: 'Century Scholar', icon: '📚', xp: 150, category: 'study' }
};

exports.addXP = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.xp += amount;
  user.level = Math.floor(user.xp / 100) + 1;
  await user.save();
  return user;
};

exports.unlockBadge = async (userId, badgeId) => {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  const existing = await Achievement.findOne({ user: userId, badgeId });
  if (existing) return existing;

  const achievement = await Achievement.create({
    user: userId,
    badgeId,
    name: badge.name,
    icon: badge.icon,
    xpReward: badge.xp,
    category: badge.category
  });

  await User.findByIdAndUpdate(userId, { $push: { achievements: achievement._id } });
  await exports.addXP(userId, badge.xp);
  return achievement;
};

exports.updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.lastStudyDate) {
    const last = new Date(user.lastStudyDate);
    last.setHours(0, 0, 0, 0);
    const diff = (today - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      user.studyStreak += 1;
    } else if (diff > 1) {
      user.studyStreak = 1;
    }
  } else {
    user.studyStreak = 1;
  }

  user.lastStudyDate = today;
  await user.save();

  if (user.studyStreak === 7) await exports.unlockBadge(userId, 'streak_7');
  if (user.studyStreak === 30) await exports.unlockBadge(userId, 'streak_30');

  return user.studyStreak;
};

exports.BADGES = BADGES;
