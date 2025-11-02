const { Together } = require("together-ai");
const { OpenAI } = require("openai");
const axios = require('axios');
const { response } = require("express");


// Initialize NVIDIA client for OpenAI API
const openai_NVIDIA = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// Initialize OpenAI client for OpenRouter 
const openaiChatBot = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
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
    //.error('Error parsing JSON:', error);
    return null;
  }
}

// query for chatbot integration (non-streaming)
const llmQuery = async (req, res) => {
  const { userMessage, botContext } = req.body;
  
  try {
    // Validate input
    if (!userMessage || !botContext) {
      return res.status(400).json({ 
        error: 'Missing required fields: userMessage and botContext' 
      });
    }
    const UNIVERSAL_CONTEXT = `You're a friendly AI chatbot assistant.

**Response Rules:**
- Keep it SHORT (1-2 sentences)
- Always use HTML: <p>, <strong>, <ul>, <li>, <br>
- Be casual & helpful 😊
- Use emojis naturally

**Boundaries:**
- Only answer from given info
- Don't make stuff up
- Don't know? → "I don't have that info 😅 Contact support!"
- Off-topic? → "Outside my scope! Contact support."
- Complex issue? → "This needs human help! Contact support."

**Example:**
Q: "What's the price?"
A: "<p>Plans start at <strong>$X/month</strong>! 💰</p>"

---
**Your Platform Info:**
`;

// HOW TO USE:
const finalPrompt = UNIVERSAL_CONTEXT + botContext;






    const completion = await openai_NVIDIA.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5", // Fast + high quality
      messages: [
        {
          "role": "system",
          "content": finalPrompt+`/no_think`
        },
        {
          "role": "user",
          "content": userMessage
        }
      ],
      temperature: 0.6,
      top_p: 0.7,
      max_tokens: 2048,
      stream: false // No streaming
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return res.status(200).json({ data: response });

  } catch (error) {
    console.error('LLM Query Error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
};

// Enhanced AI assistant for email generation and responses
const askAI = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.userPrompt) {
      return res.status(400).json({ 
        error: 'Missing required field: userPrompt' 
      });
    }

    // Build chat history with validation
    const chat = (req.body.aiResponse || [])
      .filter(c => c && typeof c === 'object')
      .map(c => ({
        role: c.role || "assistant",
        content: String(c.content || "")
      }))
      .concat([{ 
        role: 'user', 
        content: String(req.body.userPrompt) 
      }]);

    // Safely stringify feedback data
    const feedbackData = req.body.feedbackData || {};
    const data = JSON.stringify(feedbackData)
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
    console.log({data})
    
    const username = req.user?.name || "Unknown User";
    const userMail = req.user?.email || "Unknown Email";

    // Make API call with timeout
    const completion = await Promise.race([
      openai_NVIDIA.chat.completions.create({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 2048,
        messages: [
          {
            role: "system",
            content: `CRITICAL: You MUST respond ONLY with valid JSON. No other text before or after.

Enhanced AI Email Assistant
You analyze feedback and generate professional emails or conversational responses.

Context:
- User Name: ${username}
- User Email: ${userMail}
- User Role: Management Head
- Feedback/Data: ${data}

MANDATORY JSON OUTPUT FORMAT:
{
  "response": "<p>Your 2-3 sentence response here</p>",
  "reports_or_emails": {
    "mail": {
      "subject": "Subject line",
      "body": "<html>Full email body with signature</html>"
    }
  },
  "sug1": "First suggestion",
  "sug2": "Second suggestion"
}

Response Rules:
1. "response" field (REQUIRED):
   - Max 2-3 sentences
   - Use simple HTML: <p>, <strong>, <ul>, <li>, <br>
   - Conversational, friendly tone
   - NO email structure here

2. "reports_or_emails" field (CONDITIONAL):
   Generate ONLY if user explicitly requests:
   - "send email", "draft email", "notify [team]"
   - "create report", "write message", "alert team"
   
   Otherwise, OMIT this field entirely (don't include empty object)

3. Team Filtering (MANDATORY):
   Extract team name from user message:
   - Cyber Team: vulnerabilities, threats, patching, compliance
   - HR Team: hiring, policies, performance, wellness
   - DevOps: deployment, CI/CD, monitoring
   - Filter 100% by team - exclude irrelevant data

4. Email Format (when requested):
   Subject: Clear, team-specific
   Body: HTML with:
   - Greeting: "Dear [Team Name]," or "Dear Team,"
   - Context paragraph (team-specific)
   - Bullet points: <ul><li>relevant items</li></ul>
   - Call to action
   - MANDATORY Signature:
   <div style="margin-top:20px;padding-top:15px;border-top:1px solid #ddd;">
     <p style="margin:0;">Regards,</p>
     <p style="margin:0;"><strong>${username}</strong></p>
     <p style="margin:0;"><a href="mailto:${userMail}">${userMail}</a></p>
     <p style="margin:0;color:#666;">Management Head</p>
   </div>

5. Suggestions (REQUIRED):
   - sug1: Action-oriented suggestion
   - sug2: Follow-up suggestion

Examples:

User: "What are the main Cyber Team issues?"
Response:
{
  "response": "<p>The Cyber Team is facing unpatched servers and weak MFA implementation.</p>",
  "sug1": "Draft email to Cyber Team about patching timeline",
  "sug2": "Review MFA implementation status"
}

User: "Send email to HR about onboarding delays"
Response:
{
  "response": "<p>Email draft prepared for HR regarding onboarding concerns.</p>",
  "reports_or_emails": {
    "mail": {
      "subject": "Action Required: Onboarding Process Delays",
      "body": "<html><body style='font-family:Arial,sans-serif;max-width:600px;'><p>Dear HR Team,</p><p>Recent feedback indicates delays in our onboarding process...</p><ul><li>New hire documentation pending</li><li>Training schedules not communicated</li></ul><p>Please prioritize addressing these items.</p><div style='margin-top:20px;padding-top:15px;border-top:1px solid #ddd;'><p style='margin:0;'>Regards,</p><p style='margin:0;'><strong>${username}</strong></p><p style='margin:0;'><a href='mailto:${userMail}'>${userMail}</a></p><p style='margin:0;color:#666;'>Management Head</p></div></body></html>"
    }
  },
  "sug1": "Follow up on documentation status",
  "sug2": "Schedule meeting with HR lead"
}

CRITICAL RULES:
✓ Output ONLY valid JSON
✓ No markdown, no code blocks, no extra text
✓ Escape all quotes in HTML strings
✓ Keep response ≤3 sentences
✓ Always include sug1 and sug2
✓ Omit reports_or_emails if not requested
✓ Filter strictly by team name
✗ Never include placeholder text
✗ Never return empty objects
✗ Never add explanatory text outside JSON` +`/no_think`
          },
          ...chat
        ],
        response_format: { type: "json_object" } // Force JSON mode
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 30000)
      )
    ]);

    const result = completion.choices?.[0]?.message?.content;
    
    if (!result) {
      throw new Error('Empty response from AI');
    }

    console.log("Raw AI Response:", result);

    // Extract and parse JSON
    const cleanResult = extractCleanJSON(result);
    
    // Validate the parsed result
    const validatedResult = validateAIResponse(cleanResult);

    return res.status(200).json({ response: validatedResult });

  } catch (error) {
    console.error("AI Assistant Error:", error);
    
    // Determine appropriate error response
    if (error.message === 'API timeout') {
      return res.status(504).json({ 
        response: {
          response: '<p>Request timed out. Please try again.</p>',
          error: 'timeout'
        }
      });
    }
    
    return res.status(500).json({ 
      response: {
        response: '<p>Sorry, the AI is under maintenance right now. Please try again later.</p>',
        error: 'service_unavailable'
      }
    });
  }
};

/**
 * Extracts and parses JSON from AI response text
 * Handles various edge cases and malformed JSON
 */
function extractCleanJSON(text) {
  if (!text || typeof text !== "string") {
    return { 
      error: "empty_response",
      response: "<p>Received empty response from AI.</p>" 
    };
  }

  try {
    // Remove thinking tags if present
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // If response starts with HTML tags, wrap it in JSON
    if (text.startsWith('<') && !text.includes('{')) {
      console.log("Detected HTML-only response, converting to JSON");
      return {
        response: text,
        sug1: "Tell me more about the feedback",
        sug2: "Show me specific team issues"
      };
    }

    // Try to find JSON block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.log("No JSON found, treating as plain response");
      return { 
        response: text.includes('<') ? text : `<p>${text}</p>`,
        sug1: "Analyze the feedback data",
        sug2: "Show key insights"
      };
    }

    // Extract JSON string (check both capture groups)
    let jsonString = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];

    // Clean the JSON string
    jsonString = cleanJSONString(jsonString);

    // Attempt to parse
    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (parseErr) {
      // Try rescue parsing
      return rescueParseJSON(jsonString, text);
    }

  } catch (error) {
    console.error("JSON extraction error:", error);
    return { 
      error: "extraction_failure",
      response: "<p>Failed to process AI response.</p>",
      raw: text.substring(0, 500)
    };
  }
}

/**
 * Cleans JSON string by removing common formatting issues
 */
function cleanJSONString(str) {
  return str
    .replace(/^```json\s*/i, '')  // Remove json code block marker
    .replace(/^```\s*/, '')        // Remove generic code block marker
    .replace(/```\s*$/, '')        // Remove closing code block
    .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
    .replace(/[""]/g, '"')         // Normalize quotes
    .replace(/['']/g, "'")         // Normalize single quotes
    .replace(/\\(\r?\n)/g, '')     // Remove line continuation backslashes
    .replace(/\\\s+/g, ' ')        // Replace escaped whitespace
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

/**
 * Attempts to rescue malformed JSON
 */
function rescueParseJSON(jsonString, originalText) {
  try {
    // Find the outermost braces
    const jsonStart = jsonString.indexOf("{");
    const jsonEnd = jsonString.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const innerJSON = jsonString.slice(jsonStart, jsonEnd + 1);
      
      // Try parsing the extracted portion
      const parsed = JSON.parse(innerJSON);
      return parsed;
    }
  } catch (err) {
    console.error("Rescue parse failed:", err);
  }
  
  // Last resort: treat as plain text response
  return { 
    response: originalText.includes('<') ? originalText : `<p>${originalText}</p>`,
    sug1: "Analyze feedback trends",
    sug2: "Show critical issues"
  };
}

/**
 * Validates and sanitizes the AI response structure
 */
function validateAIResponse(aiResponse) {
  // If there was an error in parsing, return error response
  if (aiResponse.error) {
    return {
      response: aiResponse.response || "<p>Unable to process AI response.</p>",
      error: aiResponse.error
    };
  }

  // Ensure required fields exist
  const validated = {
    response: aiResponse.response || "<p>No response generated.</p>"
  };

  // Validate reports_or_emails structure if present
  if (aiResponse.reports_or_emails) {
    if (typeof aiResponse.reports_or_emails === 'object' && 
        aiResponse.reports_or_emails.mail) {
      
      const mail = aiResponse.reports_or_emails.mail;
      
      // Validate email structure
      if (mail.subject && mail.body) {
        validated.reports_or_emails = {
          mail: {
            subject: String(mail.subject).trim(),
            body: String(mail.body).trim()
          }
        };
      }
    }
  }

  // Add suggestions if present
  if (aiResponse.sug1) {
    validated.sug1 = String(aiResponse.sug1).trim();
  }
  if (aiResponse.sug2) {
    validated.sug2 = String(aiResponse.sug2).trim();
  }

  return validated;
}


module.exports = { llmQuery,askAI };
