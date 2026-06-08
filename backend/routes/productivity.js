const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const productivity = require('../controllers/productivityController');

router.get('/tasks', protect, productivity.getTasks);
router.post('/tasks', protect, productivity.createTask);
router.put('/tasks/:id', protect, productivity.updateTask);
router.delete('/tasks/:id', protect, productivity.deleteTask);

router.get('/habits', protect, productivity.getHabits);
router.post('/habits', protect, productivity.createHabit);
router.post('/habits/:id/complete', protect, productivity.completeHabit);

router.get('/goals', protect, productivity.getGoals);
router.post('/goals', protect, productivity.createGoal);
router.put('/goals/:id', protect, productivity.updateGoal);

router.post('/sessions', protect, productivity.logStudySession);
router.get('/sessions', protect, productivity.getStudySessions);

module.exports = router;
