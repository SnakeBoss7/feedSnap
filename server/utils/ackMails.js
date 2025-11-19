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
    
    
    return { success: false, error: err.message };
  }
}

module.exports = { sendFeedbackEmail };