const express = require('express'); 
const { llmQuery,askAI } = require('../controllers/llmController');
const router = express.Router();
router.post('/llmquery', llmQuery);
router.post('/askAI', askAI);
module.exports = router;