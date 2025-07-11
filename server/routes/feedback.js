const express = require('express');
const router = express.Router();
const {createFeed}  = require('../controllers/feebackController');
const upload = require('../middleware/multer');
router.post('/addfeedback',upload.single('image'),createFeed)
module.exports = router;