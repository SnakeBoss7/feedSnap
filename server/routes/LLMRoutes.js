const express = require('express'); 
const { llmQuery,askAI } = require('../controllers/llmController');
const verifyUser = require('../middleware/jwtverify');
const router = express.Router();
router.post('/llmquery',llmQuery);
router.post('/askAI',verifyUser, askAI);
module.exports = router;