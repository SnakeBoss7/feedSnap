const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const {askTogetherAI} = require('../controllers/llmController');

router.post('/getdata',askTogetherAI)
module.exports = router;