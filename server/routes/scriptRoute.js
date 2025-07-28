const express = require('express')
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const {scriptCreate} = require('../controllers/scriptController');

router.post('/create',verifyUser,scriptCreate);
router.get('/test',verifyUser, (req, res) => {
  console.log('🎯 Route hit');
  res.send('Test passed');
});
module.exports = router;