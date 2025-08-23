const express = require('express'); 
const { llmQuery } = require('../controllers/llmController');
const router = express.Router();
router.post('/llmquery', llmQuery);
module.exports = router;