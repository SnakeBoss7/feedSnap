const { Together } = require("together-ai");
const { OpenAI } = require("openai");
const axios = require('axios');

// Initialize Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});
function extractCleanJSON(aiResponse) {
  try {
    // Remove the <think> tags and everything inside them
    let cleaned = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Remove markdown code block syntax (```json and ```)
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    // Parse the JSON string into an object
    const jsonObject = JSON.parse(cleaned);
    
    return jsonObject;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// Example usage:
const openai_NVIDIA = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// Initialize OpenAI client for OpenRouter 
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
const openaiChatBot = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});
const llmQuery = async (req,res) => {
    const {userMessage} = req.body;
  try {
    const completion = await openaiChatBot.chat.completions.create({
    model: "mistralai/mistral-small-3.2-24b-instruct:free",
    messages: [
        {
               "role": "system",
        "content": [
          {
            "type": "text",
            "text": `You are FeedSnap’s AI assistant — a friendly chatbot helping users understand FeedSnap’s services, pricing, and features.

Rules:

Only answer using the info below.

Keep replies under 1 sentence, casual and friendly.

Always use HTML tags like <b>, <h1>, <h2>, <ul>, <li> for formatting in your answers.

Off-topic/deep questions → reply: “Outside my scope 😅, please contact us.”

Missing details/special help → suggest contacting rahuldharwal12005@gmail.com
 or +1 (202) 555-0199.

Never invent answers.

Urgent/complex issues → recommend direct contact.

Use emojis naturally.

Company Info
Name: FeedSnap
Email: rahuldharwal12005@gmail.com

Phone: +1 (202) 555-0199
Support Hours: 9 AM – 8 PM IST (Mon–Sat)

About FeedSnap
FeedSnap lets website owners embed a feedback widget or AI chatbot using a simple script. Works on any site, with analytics & customization.

Plans

Tier 1 – Free: Feedback popup, Unlimited submissions, Basic dashboard

Tier 2 – Pro ($10/mo): Basic chatbot, Simple analytics, Email support

Tier 3 – Premium ($25/mo) 🚧: AI Chatbot with Web Scraping, Site navigation help, Priority support (in development)

FAQs

Install? Copy & paste the <script> tag

Free trial? Tier 1 is free forever

Payments? Cards, PayPal, UPI

Cancel anytime? Yes, no fees

Tier 3 release? Coming soon 🚀

Vision
Affordable, lightweight, powerful feedback + chatbot + analytics suite for all website owners.`,
          },
        ]
        },
      {
        
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": userMessage
          },
        ]
      }
    ],
    
  });
  console.log(completion.choices[0].message);
  return res.status(200).json({ data: completion.choices[0].message.content })
  } catch (error) {
    
    
    return res.status(400).json({ data: completion.choices[0].message.content })
  } 

}
const llmQuery1 = async (req,res) => {
  const {userMessage} = req.body;
const response = await together.chat.completions.create({
  messages: [
    {
      role: "system",
      content: `You are the virtual assistant for a website. You will be provided with specific company or organization information below.

Your rules:
1. ONLY answer based on the provided information.
2. Keep all answers short, clear, and conversational (1 sentences max).
3. Do not answer irrelevant, off-topic, or philosophical questions. Politely say they are outside your scope.
4. If the user asks for something not covered in the dataset or requires niche/complex help, redirect them to the official contact details provided (phone, email, etc.).
5. Never invent or assume details.
6. Always encourage direct contact for urgent or highly specific issues.
7.USE EMOJIS

📖 FeedSnap – AI Assistant Data

Website: FeedSnap
Email: rahuldharwal12005@gmail.com

Phone (dummy): +1 (202) 555-0199
Support Hours: 9 AM – 8 PM IST (Mon–Sat)

🎯 Overview

FeedSnap lets website owners add a feedback popup and optional AI chatbot via script injection. Works on any site.

💰 Plans

Tier 1 – Free

Feedback popup

Unlimited submissions

Basic dashboard

Tier 2 – Pro ($10/mo)

Tier 1 + Basic Chatbot (predefined replies)

Simple analytics

Email support

Tier 3 – Premium ($25/mo) 🚧

Tier 2 + AI Chatbot w/ Web Scraping

Helps users navigate site

Priority support

In development

⚡ FAQs

Install? Copy <script> into site.

Free trial? Tier 1 is free.

Payments? Cards, PayPal, UPI.

Cancel? Anytime, no fees.

Tier 3 launch? Coming soon.

🌟 Vision

Affordable, lightweight suite for feedback + chatbot + analytics.
`
    },
    {
      role: "user",
      content: userMessage
    }
  ],
  model: "lgai/exaone-deep-32b"
});

console.log(response.choices[0].message.content.split('</thought>')[1])
return res.status(200).json({ data: response.choices[0].message.content.split('</thought>')[1] });
};



 const askAI= async(req,res) =>{
  let chat = (req.body.aiResponse || []).map(c => ({
  role: c.role || "assistant",
  content: c.content || ""
})).concat([{ role:'user', content:req.body.userPrompt }]);

let data = JSON.stringify(req.body.feedbackData).replace(/`/g, '\\`');
console.log({data})
let username = req.user?.name || "Unknown User";
let userMail = req.user?.email || "Unknown Email";

try {
  const completion = await openai_NVIDIA.chat.completions.create({
    model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `
Enhanced AI Email Assistant Prompt

You are an intelligent assistant that analyzes user context and feedback to generate professional emails or provide conversational responses.

Context
- User Name: ${username}
- User Email: ${userMail}
- User Role: Management Head
- Feedback/Data: ${data}

Response Rules

response Field:
- Keep it short and to the point – 2-3 sentences max
- Conversational replies only
- Use simple HTML: <p>, <strong>, <ul>, <li>, <br>
- Friendly, helpful, professional tone
- Never include email structure here

reports_or_emails Field:

⚠️ CRITICAL: Only generate emails when the user EXPLICITLY requests it using phrases like:
- "send email"
- "draft an email"
- "notify [team/person]"
- "create a report"
- "send a message"
- "alert the team"
- "write an email about"

Do NOT generate emails for:
- General analysis requests
- Summary requests
- Statistics or data questions
- Casual conversation
- Feedback acknowledgment
- Questions about the data

Leave this field EMPTY unless the user specifically asks you to generate an email or report.

Email Format (only when explicitly requested):
{
  "subject": "Clear subject line",
  "body": "<html>...email body with signature...</html>"
}

Email Body Structure:
- Greeting: Dear Team, / Dear [Recipient],
- Context paragraph
- Main content with <ul><li> for issues/points
- Call-to-action
- Mandatory signature:

<div style="margin-top:20px;padding-top:15px;border-top:1px solid #ddd;">
  <p style="margin:0;">Regards,</p>
  <p style="margin:0;"><strong>${username}</strong></p>
  <p style="margin:0;"><a href="mailto:${userMail}">${userMail}</a></p>
  <p style="margin:0;color:#666;">Management Head</p>
</div>

Email Styling Guidelines:
- Use inline CSS for professional appearance
- Color scheme: headers (#2c3e50), highlights (#dc3545 for urgent, #28a745 for positive)
- Clean spacing with padding and margins
- Border separators where appropriate
- Responsive max-width: 600px

Output Format (JSON Only):
{
  "response": "<p>Brief, concise reply here.</p>",
  "reports_or_emails": {
    "mail": {
      "subject": "Subject here",
      "body": "<html>...body...</html>"
    }
  },
  "sug1": "Create an email about [issue]",
  "sug2": "Send a follow-up for [action]"
}

Critical Rules

✅ DO:
- Keep response brief (2-3 sentences)
- Output valid JSON only
- Escape HTML properly in JSON strings
- Include signature in all emails
- Omit reports_or_emails field entirely if no email requested
- Make emails engaging with good CSS and clear structure
- Be conversational and helpful in responses

❌ DON'T:
- Write long responses (keep under 3 sentences)
- Generate emails unless explicitly asked by user
- Use team names as keys
- Generate emails for analysis/summary requests
- Include email content in response field
- Return empty objects - omit the field instead
- Assume user wants an email without them saying so

Examples:

User: "What are the main issues in this feedback?"
Response: { "response": "<p>Analysis here...</p>", "sug1": "...", "sug2": "..." }
(NO reports_or_emails field)

User: "Send an email to the team about this"
Response: { "response": "<p>I've drafted an email...</p>", "reports_or_emails": { "mail": {...} }, "sug1": "...", "sug2": "..." }
(INCLUDES reports_or_emails field)`
      },
      ...chat
    ]
  });

  // if streaming is not supported, get text like:
let result = completion.choices?.[0]?.message?.content;
console.log("Raw AI Response:", result);

function extractCleanJSON(text) {
  // --- Defensive guard ---
  if (!text || typeof text !== "string") {
    console.warn("⚠️ Invalid text input for extractCleanJSON");
    return { error: "Empty AI response" };
  }

  try {
    // 1️⃣ Remove <think> blocks and explanations
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // 2️⃣ Try to find first valid JSON object pattern
    const match = text.match(/json\s*\{[\s\S]*\}|\{[\s\S]*\}/);
    if (!match) {
      console.warn("⚠️ No JSON object found in response");
      return { error: "No JSON found", raw: text };
    }

    let jsonString = match[0];

    // 3️⃣ Cleanup common AI formatting mistakes
    jsonString = jsonString
      .replace(/^json/, "")                 // remove leading “json”
      .replace(/,\s*([}\]])/g, "$1")       // remove trailing commas
      .replace(/[“”]/g, '"')                // fix smart quotes
      .replace(/[‘’]/g, "'")                // fix single quotes
      .trim();

    // 4️⃣ Try main parse
    try {
      const parsed = JSON.parse(jsonString);
      console.log("✅ Parsed AI JSON successfully");
      return parsed;
    } catch (err) {
      console.warn("⚠️ Primary parse failed:", err.message);

      // 5️⃣ Try rescue mode: find first valid JSON substring
      const jsonStart = jsonString.indexOf("{");
      const jsonEnd = jsonString.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const innerJSON = jsonString.slice(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(innerJSON);
          console.log("⚙️ Parsed AI JSON in rescue mode");
          return parsed;
        } catch (innerErr) {
          console.error("💥 Rescue mode failed:", innerErr.message);
        }
      }

      // 6️⃣ Fallback if all parsing fails
      return { error: "Invalid JSON format", raw: jsonString };
    }
  } catch (fatal) {
    console.error("💣 extractCleanJSON fatal error:", fatal.message);
    return { error: "Extraction failure", raw: text };
  }
}

let cleanResult = extractCleanJSON(result);
console.log("Clean Parsed AI Result:", cleanResult);


  return res.status(200).json({ response: cleanResult });

} catch (error) {
  console.log("OpenAI/NVIDIA API Error:", error);
  return res.status(500).json({ response: 'Sorry, the AI is under maintenance right now' });
}


}

module.exports = { llmQuery,askAI };
