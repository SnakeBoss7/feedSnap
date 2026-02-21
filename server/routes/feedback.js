const express = require('express');
const router = express.Router();
const { createFeed, getFeed, display, allFeedback, exportFeedback, getDashboardData, deleteFeedback, bulkDeleteFeedback } = require('../controllers/feebackController');
const upload = require('../middleware/multer');
const verifyUser = require('../middleware/jwtverify');
router.post('/addfeedback', createFeed)
router.get('/getfeedback', verifyUser, getFeed)
router.get('/getAnalytics', verifyUser, display)
router.get('/getFeedbacks', verifyUser, allFeedback)
router.get('/export', verifyUser, exportFeedback)
router.get('/allFeedback', verifyUser, allFeedback);
router.get('/dashboard-data', verifyUser, getDashboardData);
router.delete('/delete/:id', verifyUser, deleteFeedback);
router.post('/bulk-delete', verifyUser, bulkDeleteFeedback);
module.exports = router;