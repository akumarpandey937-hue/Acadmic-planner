const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const placement = require('../controllers/placementController');

router.get('/', protect, placement.getOrCreate);
router.put('/', protect, placement.update);
router.post('/topper-mode', protect, placement.topperMode);

module.exports = router;
