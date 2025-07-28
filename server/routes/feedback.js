const express = require('express');
const router = express.Router();
const {createFeed,getFeed}  = require('../controllers/feebackController');
const upload = require('../middleware/multer');
const verifyUser = require('../middleware/jwtverify');
router.post('/addfeedback',upload.single('image'),createFeed)
router.get('/getfeedback',verifyUser,getFeed)
module.exports = router;