const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/jwtverify');
const { sendEmail, loadTemplate } = require('../utils/mailService');

router.post('/send', verifyUser, async (req, res) => {
    try {
        console.log(req.body);
        let { to, subject, body } = req.body;

        // Validate required fields
        if (!to || !subject || !body) {
            return res.status(400).json({
                error: "Missing required fields: to, subject, and body are required"
            });
        }

        // Wrap AI-generated content in the branded template
        const styledHtml = loadTemplate("brandedMail.html", {
            content: body,
            year: new Date().getFullYear().toString(),
        });

        const result = await sendEmail(to, subject, styledHtml);

        if (result.success) {
            res.status(200).json({
                message: "Email sent successfully",
                data: result.data
            });
        } else {
            res.status(500).json({
                error: "Failed to send email",
                details: result.error
            });
        }
    } catch (error) {
        console.error("Error in /send route:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

module.exports = router;
