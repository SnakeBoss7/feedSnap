const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const { sendEmail } = require('../utils/ackMails');

router.post('/send', verifyUser, (req, res) => {
    console.log(req.body);
    let { to, subject, body } = req.body;
    sendEmail(to, subject, body)
    res.status(200).json({ mess: "cooked" })
});
module.exports = router;