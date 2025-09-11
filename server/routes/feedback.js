const express = require('express');
const router = express.Router();
const {createFeed,getFeed,display, allFeedback, exportFeedback}  = require('../controllers/feebackController');
const upload = require('../middleware/multer');
const verifyUser = require('../middleware/jwtverify');
router.post('/addfeedback',upload.single('image'),createFeed)
router.get('/getfeedback',verifyUser,getFeed)
router.get('/getAnalytics',verifyUser,display)
router.get('/getFeedbacks',verifyUser,allFeedback)
router.get('/export',verifyUser,exportFeedback)
module.exports = router;