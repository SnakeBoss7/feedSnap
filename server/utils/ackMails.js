// const nodemailer = require("nodemailer");
// const SendmailTransport = require("nodemailer/lib/sendmail-transport");

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com', // or your SMTP host
//   port: 587, // Try 587 (STARTTLS) instead of 465 (SSL)
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASS // Use app password for Gmail
//   },
//   connectionTimeout: 10000, // 10 seconds
//   greetingTimeout: 10000,
//   socketTimeout: 10000
// });

// async function sendFeedbackEmail(to, title, desc) {
//   try {
//     const info = await transporter.sendMail({
//       from: `"FeedSnap" <chicojordandiddy@gmail.com>`,
//       to,
//       subject: title,
//       html: desc,
//     });
//     console.log("Email sent:", info.response);
//   } catch (err) {
//     console.error("Email failed:", err);
//   }
// }

// const { Resend } = require('resend');

// const resend = new Resend(process.env.RESEND_API_KEY);

// async function sendFeedbackEmail(to, title, desc) {
//   try {
//     const data = await resend.emails.send({
//       from: 'FeedSnap <onboarding@resend.dev>', // Must use verified domain
//       to: [to],
//       subject: title,
//       html: desc,
//     });
//     console.log("Email sent:", data);
//     return data;
//   } catch (err) {
//     console.error("Email failed:", err);
//     throw err;
//   }
// }

// // call it
// // sendFeedbackEmail("rahuldharwal12005@gmail.com","Urgent Cybersecurity Issues Reported in Script Generation Section",`<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'><div style='max-width: 600px; margin: 0 auto; padding: 20px;'><p>Dear Marketing Team,</p><p>We need to address urgent matters regarding our online presence based on recent feedback:</p><ul style='margin: 15px 0; padding-left: 20px;'><li style='margin-bottom: 10px;'><strong style='color: #dc3545;'>YouTube Meme Issue:</strong> The website is being mocked in memes on YouTube, which is affecting our reputation. We need a strategy to mitigate this.</li><li style='margin-bottom: 10px;'><strong style='color: #28a745;'>Instagram Growth:</strong> The platform is booming on Instagram - let's capitalize on this momentum with targeted campaigns.</li></ul><p>Please develop a comprehensive plan to address the YouTube situation while amplifying our Instagram success. Submit your strategy proposal by EOD Friday.</p><div style='margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;'><p style='margin: 0;'>Regards,</p><p style='margin: 0;'><strong>Rahul Dharwal</strong></p><p style='margin: 0;'><a href='mailto:rahuldharwal12005@gmail.com'>rahuldharwal12005@gmail.com</a></p><p style='margin: 0; color: #666;'>Management Head</p></div></div></body></html>`)
// module.exports = {sendFeedbackEmail};
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

async function sendFeedbackEmail(to, title, desc) {
  try {
    // Use YOUR trial domain from MailerSend dashboard
    const sentFrom = new Sender(
      `noreply@${process.env.MAILERSEND_DOMAIN}`, 
      "FeedSnap"
    );
    console.log(process.env.MAILERSEND_API_KEY);
    console.log(process.env.MAILERSEND_DOMAIN);

    
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(title)
      .setHtml(desc);

    const result = await mailerSend.email.send(emailParams);
    console.log("✅ Email sent successfully!");
    return { success: true, data: result };
    
  } catch (err) {
    console.error("❌ Email failed:", err);
    
    // Detailed error logging
    if (err.response) {
      console.error("Error body:", err.response.body);
    }
    
    return { success: false, error: err.message };
  }
}

module.exports = { sendFeedbackEmail };