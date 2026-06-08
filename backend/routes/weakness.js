const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { aiLimiter } = require('../middleware/security');
const weakness = require('../controllers/weaknessController');

router.post('/analyze', protect, aiLimiter, upload.single('file'), weakness.analyze);
router.get('/history', protect, weakness.getHistory);

module.exports = router;
