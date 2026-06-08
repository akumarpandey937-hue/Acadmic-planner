const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const gamification = require('../controllers/gamificationController');

router.get('/leaderboard', protect, gamification.getLeaderboard);
router.get('/achievements', protect, gamification.getAchievements);
router.get('/challenges', protect, gamification.getChallenges);
router.patch('/challenges/:id', protect, gamification.updateChallengeProgress);
router.get('/profile', protect, gamification.getProfile);

module.exports = router;
