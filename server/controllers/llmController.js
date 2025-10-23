const { Together } = require("together-ai");
const { OpenAI } = require("openai");
const axios = require('axios');

// Initialize Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});


// Initialize OpenAI client for OpenRouter 
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});


const llmQuery = async (req,res) => {
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

// const askAI = async (req, res) => {
//   let chat = [...req.body.aiResponse,{role:'user',content:req.body.userPrompt}]
//   let data = JSON.stringify(req.body.feedbackData);

//   console.log(data);
//   try {
//     const { systemPrompt, userPrompt } = req.body;
//     const response = await together.chat.completions.create({
//   messages: [ {
//       role: "system",
//       content: data
//     },...chat
    
//   ],
//   model: "lgai/exaone-deep-32b"
// });
//   console.log(response.choices[0].message.content.split('</thought>')[1])
//     return res.status(200).json({response:response.choices[0].message.content.split('</thought>')[1].trim()});
    
//   } catch (error) {
//     console.error(' Error in askTogetherAI:', error.response?.data || error.message);
//     throw new Error('Failed to get response from Together AI');
//     res.status(200).json({response:'sorry the ai is under maintanece right now'});
//   }
// };

const askAI = async (req, res) => {
  let chat = [
    ...req.body.aiResponse,
    { role: "user", content: req.body.userPrompt }
  ];

  let data = '[{"title":"Bug Reports","desc":"i found a vunalerbility very dangerous it can help in ddos attack !!!!!!","url":"localhost"},{"title":"Feature Requests","desc":"ytjdjdjyj","url":"localhost"},{"title":"Bug Reports","desc":"goood !!!!!","url":"localhost"},{"title":"Feature Requests","desc":"DFGFG","url":"localhost"},{"title":"bug","desc":"DSFDFDF","url":"localhost"},{"title":"General Feedback","desc":"okish\n","url":"localhost"},{"title":"Bug Reports","desc":"its tooo heavy\n","url":"localhost"},{"title":"General Feedback","desc":"bad ","url":"localhost"},{"title":"Bug Reports","desc":"we need tier 3","url":"localhost"},{"title":"Improvements","desc":"this is shit\n","url":"localhost"},{"title":"General Feedback","desc":"all gooood","url":"localhost"},{"title":"Bug Reports","desc":"It was ok","url":"localhost"},{"title":"Feature Requests","desc":"FADFFD","url":"localhost"},{"title":"Improvements","desc":"trh","url":"localhost"}]';

  console.log("Contextual data:", data);

  try {
    const response = await openai.chat.completions.create({
      model: "qwen/qwen3-235b-a22b:free",
      max_tokens: 600,
      temperature: 0.3,
      messages: [
        ...chat,
        {
          role: "user",
          content: `
Reply ONLY in strict JSON. Do NOT add markdown, reasoning, or code fences.
Shape:
{
"User_response": "Answer to user query",
"reports": {
"towhom": "e.g. HR, cybersecurity, management (ONLY one)",
"report": "Professional, detailed, formal report. Use paragraphs, email style. Only include if user explicitly asks."
}
}
Rules:
- ALWAYS include "User_response".
- Include "reports" ONLY if user explicitly requests a report.
- Contextual data: ${data}
- User query: ${req.body.userPrompt}`
        }
      ]
    });

    let aiMessage = response.choices[0].message?.content || "";
    console.log("Raw AI Message:", aiMessage);

    // Extract only the first JSON object
    const firstCurly = aiMessage.indexOf("{");
    const lastCurly = aiMessage.lastIndexOf("}");
    if (firstCurly !== -1 && lastCurly !== -1) {
      aiMessage = aiMessage.slice(firstCurly, lastCurly + 1);
    }

    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(aiMessage);
    } catch (e) {
      console.error("========== AI JSON Parse Error ==========");
      console.error("❌ Raw AI Message (extracted JSON):", aiMessage);
      console.error("❌ Parse Error:", e.message);
      console.error("=========================================");
      parsed = { error: "Invalid JSON", raw: aiMessage };
    }

    console.log("========== AI Response ==========");
    console.log("📝 Parsed JSON:", parsed);
    console.log("=================================");

    return res.status(200).json({ response: parsed });

  } catch (error) {
    console.error("========== askAI ERROR ==========");
    console.error("❌ Error:", error.response?.data || error.message);
    console.error("=================================");
    return res.status(500).json({ response: "sorry the ai is under maintenance right now" });
  }
};



module.exports = { llmQuery,askAI };