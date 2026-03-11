const axios = require("axios");
const path = require("path");
const fs = require("fs");

const url = "https://smtp.maileroo.com/api/v2/emails"
const mail_api = process.env.MAILERO_API_KEY;

/**
 * Reads an HTML template file from the utils directory and replaces placeholders.
 * @param {string} templateName - The filename of the template (e.g. "ackMail.html")
 * @param {Object} replacements - Key-value pairs for {{placeholder}} replacement
 * @returns {string} The processed HTML string
 */
const loadTemplate = (templateName, replacements = {}) => {
  const filepath = path.join(__dirname, templateName);
  let html = fs.readFileSync(filepath, "utf-8");
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value || "");
  }
  return html;
};

const sendEmail = async (to, subject, html) => {
  const payload = {
    from: {
      address: "noreply@91f62ad75614ac1d.maileroo.org",
      display_name: "FeedSnap",
    },
    to: {
      address: to,
    },
    subject,
    html,
    tracking: true,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${mail_api}`,
        "Content-Type": "application/json",
      }
    });
    // console.log("Email sent successfully!");
    return { success: true, data: response.data };
  } catch (err) {
    // console.error("Email failed:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail, loadTemplate };
