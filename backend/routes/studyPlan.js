const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const studyPlan = require('../controllers/studyPlanController');

router.post('/', protect, aiLimiter, studyPlan.create);
router.get('/', protect, studyPlan.getAll);
router.get('/:id', protect, studyPlan.getOne);
router.patch('/:id/task', protect, studyPlan.updateTaskStatus);
router.delete('/:id', protect, studyPlan.delete);

module.exports = router;
