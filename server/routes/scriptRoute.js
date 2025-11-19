const express = require('express')
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const {scriptCreate,scriptDemo} = require('../controllers/scriptController');

router.post('/create',verifyUser,scriptCreate);
router.post('/demo',verifyUser,scriptDemo);
router.get('/test',verifyUser, (req, res) => {
  console.log('🎯 Route hit');
  res.send('Test passed');
});
module.exports = router;