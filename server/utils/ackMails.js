const nodemailer = require("nodemailer");
const SendmailTransport = require("nodemailer/lib/sendmail-transport");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chicojordandiddy@gmail.com",
    pass: "knayanhvekbfavtd",
  },
});

async function sendFeedbackEmail(to, title, desc) {
  try {
    const info = await transporter.sendMail({
      from: `"FeedSnap" <chicojordandiddy@gmail.com>`,
      to,
      subject: title,
      html: desc,
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Email failed:", err);
  }
}

// call it
// sendFeedbackEmail("rahuldharwal12005@gmail.com","Urgent Cybersecurity Issues Reported in Script Generation Section",`<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'><div style='max-width: 600px; margin: 0 auto; padding: 20px;'><p>Dear Marketing Team,</p><p>We need to address urgent matters regarding our online presence based on recent feedback:</p><ul style='margin: 15px 0; padding-left: 20px;'><li style='margin-bottom: 10px;'><strong style='color: #dc3545;'>YouTube Meme Issue:</strong> The website is being mocked in memes on YouTube, which is affecting our reputation. We need a strategy to mitigate this.</li><li style='margin-bottom: 10px;'><strong style='color: #28a745;'>Instagram Growth:</strong> The platform is booming on Instagram - let's capitalize on this momentum with targeted campaigns.</li></ul><p>Please develop a comprehensive plan to address the YouTube situation while amplifying our Instagram success. Submit your strategy proposal by EOD Friday.</p><div style='margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;'><p style='margin: 0;'>Regards,</p><p style='margin: 0;'><strong>Rahul Dharwal</strong></p><p style='margin: 0;'><a href='mailto:rahuldharwal12005@gmail.com'>rahuldharwal12005@gmail.com</a></p><p style='margin: 0; color: #666;'>Management Head</p></div></div></body></html>`)
module.exports = {sendFeedbackEmail};