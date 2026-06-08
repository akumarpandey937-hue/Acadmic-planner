const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { aiLimiter } = require('../middleware/security');
const notes = require('../controllers/notesController');

router.post('/', protect, notes.create);
router.post('/generate', protect, aiLimiter, upload.single('file'), notes.generateFromFile);
router.get('/', protect, notes.getAll);
router.put('/:id', protect, notes.update);
router.delete('/:id', protect, notes.delete);

module.exports = router;
