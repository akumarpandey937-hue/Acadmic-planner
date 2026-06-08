const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/security');
const contact = require('../controllers/contactController');

router.post('/', apiLimiter, contact.submitContact);

module.exports = router;
