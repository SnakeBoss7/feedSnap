const axios = require("axios");

const url = "https://smtp.maileroo.com/api/v2/emails"
const mail_api = process.env.MAILERO_API_KEY;

const getStyledTemplate = (content) => {
  // Strip outer html/body tags to avoid nesting issues
  const cleanContent = content
    .replace(/<\/?html[^>]*>/g, '')
    .replace(/<\/?body[^>]*>/g, '')
    .trim();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FeedSnap Notification</title>
  <!-- Google Fonts for better typography where supported -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 20px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px; /* Smooth rounded corners */
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.02); /* Premium soft shadow */
      overflow: hidden;
    }
    .header {
      /* Deep rich background for premium feel */
      background: #111827;
      padding: 32px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    /* Logo Styling */
    .logo-container {
      display: inline-block;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      font-family: 'Inter', sans-serif;
    }
    .logo-feed {
      color: #ffffff;
    }
    .logo-snap {
      /* Fallback for clients that don't support text gradients */
      color: #6366f1; 
      /* Gradient text effect */
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .content {
      padding: 32px 32px; /* Balanced padding */
      line-height: 1.6;
      font-size: 15px; /* Slightly refined size */
      color: #374151;
    }
    
    /* Polish the AI Content - Tighter Spacing */
    .content h1, .content h2, .content h3 { 
      color: #111827; 
      margin-top: 1.2em;
      margin-bottom: 0.6em; 
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.3;
    }
    .content p { 
      margin-top: 0;
      margin-bottom: 0.8em; 
      color: #4b5563;
    }
    /* Reduce gap if p is followed by list */
    .content p + ul {
        margin-top: -0.4em;
    }

    .content ul { 
      padding-left: 0; 
      margin-bottom: 1em; 
      background-color: #f9fafb;
      padding: 16px 20px 16px 36px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .content li { 
      margin-bottom: 0.4em; 
      position: relative;
    }
    .content li:last-child { margin-bottom: 0; }
    
    .content strong { 
      color: #111827; 
      font-weight: 600; 
    }
    .content a { 
      color: #4f46e5; 
      text-decoration: none; 
      font-weight: 500;
      border-bottom: 1px dotted #4f46e5;
    }
    .content a:hover {
      color: #4338ca;
    }
    .content br + br {
        display: none; /* Hide double breaks if AI adds them */
    }

    /* Signature Area Styling */
    .signature {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 6px 0;
      font-size: 12px;
      color: #9ca3af;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      font-size: 11px;
      margin: 0 8px;
    }
    .footer-links a:hover {
      color: #111827;
    }
    
    /* Button Style override if AI tries to add buttons */
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: white !important;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 8px 0;
      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <span class="logo-feed">Feed</span><span class="logo-snap">Snap</span>
        </div>
      </div>
      <div class="content">
        ${cleanContent}
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Support</a>
        </div>
        <p>Powered by <strong>FeedSnap AI</strong> Analytics Engine</p>
        <p>&copy; ${new Date().getFullYear()} FeedSnap Inc. All rights reserved.</p>
        <p>123 Tech Street, Silicon Valley, CA</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const sendEmail = async (to, subject, html) => {
  // Wrap the raw AI HTML in our beautiful template
  const styledHtml = getStyledTemplate(html);

  const payload = {
    from: {
      address: "noreply@91f62ad75614ac1d.maileroo.org",
      display_name: "FeedSnap",
    },
    to: {
      address: to,
    },
    subject,
    html: styledHtml,
    tracking: true,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${mail_api}`,
        "Content-Type": "application/json",
      }
    });
    console.log("Email sent successfully!");
    return { success: true, data: response.data };
  } catch (err) {
    console.error("Email failed:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail };
