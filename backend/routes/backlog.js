const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const backlog = require('../controllers/backlogController');

router.post('/', protect, backlog.create);
router.get('/', protect, backlog.getAll);
router.patch('/:id/status', protect, backlog.updateStatus);

module.exports = router;
