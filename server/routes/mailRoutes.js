const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const { sendFeedbackEmail } = require('../utils/ackMails');

router.post('/send', verifyUser, (req,res)=>
    {
        console.log(req.body);
        let {to,subject,body} =req.body ;
        sendFeedbackEmail(to,subject,body)
        res.status(200).json({mess:"cooked"})
    });
module.exports = router;