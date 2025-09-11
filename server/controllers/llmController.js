const { Together } = require("together-ai");
const axios = require('axios');
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
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

const askAI = async (req, res) => {
  let chat = [...req.body.aiResponse,{role:'user',content:req.body.userPrompt}]
  console.log(chat);
  try {
    const { systemPrompt, userPrompt } = req.body;
    const response = await together.chat.completions.create({
  messages: [...chat
  ],
  model: "lgai/exaone-deep-32b"
});
  console.log(response.choices[0].message.content.split('</thought>')[1])
    return res.status(200).json({response:response.choices[0].message.content.split('</thought>')[1].trim()});
    
  } catch (error) {
    console.error(' Error in askTogetherAI:', error.response?.data || error.message);
    throw new Error('Failed to get response from Together AI');
    res.status(200).json({response:'sorry the ai is under maintanece right now'});
  }
};
module.exports = { llmQuery,askAI };