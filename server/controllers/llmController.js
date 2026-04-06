const { Together } = require("together-ai");
const { OpenAI } = require("openai");
const axios = require("axios");

const openai_NVIDIA = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});
const {
  getUserAccessibleWebsites,
} = require("../controllers/feebackController");

const feedback = require("../models/feedback");

// ============================================
// Helpers
// ============================================

/**
 * Extracts and parses JSON from AI response text.
 * Handles various edge cases and malformed JSON.
 */
function extractCleanJSON(text) {
  if (!text || typeof text !== "string") {
    return {
      error: "empty_response",
      response: "<p>Received empty response from AI.</p>",
    };
  }

  try {
    // Remove thinking tags if present
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // If response starts with HTML tags, wrap it in JSON
    if (text.startsWith("<") && !text.includes("{")) {
      return {
        response: text,
        sug1: "Tell me more about the feedback",
        sug2: "Show me specific team issues",
      };
    }

    // Try to find JSON block
    const jsonMatch = text.match(
      /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/
    );

    if (!jsonMatch) {
      return {
        response: text.includes("<") ? text : `<p>${text}</p>`,
        sug1: "Analyze the feedback data",
        sug2: "Show key insights",
      };
    }

    let jsonString = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
    jsonString = cleanJSONString(jsonString);

    try {
      return JSON.parse(jsonString);
    } catch {
      return rescueParseJSON(jsonString, text);
    }
  } catch {
    return {
      error: "extraction_failure",
      response: "<p>Failed to process AI response.</p>",
      raw: text.substring(0, 500),
    };
  }
}

/**
 * Cleans JSON string by removing common formatting issues.
 */
function cleanJSONString(str) {
  return str
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\\(\r?\n)/g, "")
    .replace(/\\\s+/g, " ")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
}

/**
 * Attempts to rescue malformed JSON.
 */
function rescueParseJSON(jsonString, originalText) {
  try {
    const jsonStart = jsonString.indexOf("{");
    const jsonEnd = jsonString.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(jsonString.slice(jsonStart, jsonEnd + 1));
    }
  } catch (err) {
    console.error("Rescue parse failed:", err);
  }

  return {
    response: originalText.includes("<")
      ? originalText
      : `<p>${originalText}</p>`,
    sug1: "Analyze feedback trends",
    sug2: "Show critical issues",
  };
}

/**
 * Validates and sanitizes the AI response structure.
 */
function validateAIResponse(aiResponse) {
  if (aiResponse.error) {
    return {
      response: aiResponse.response || "<p>Unable to process AI response.</p>",
      error: aiResponse.error,
    };
  }

  const hasEmail =
    aiResponse.reports_or_emails?.mail?.subject &&
    aiResponse.reports_or_emails?.mail?.body;

  const validated = {
    response:
      aiResponse.response ||
      (hasEmail
        ? "<p>Here's your email, ready to send! 📧 Review and edit it before sending.</p>"
        : "<p>Here's what I found based on your data.</p>"),
  };

  if (
    aiResponse.reports_or_emails &&
    typeof aiResponse.reports_or_emails === "object" &&
    aiResponse.reports_or_emails.mail
  ) {
    const mail = aiResponse.reports_or_emails.mail;
    if (mail.subject && mail.body) {
      validated.reports_or_emails = {
        mail: {
          subject: String(mail.subject).trim(),
          body: String(mail.body).trim(),
        },
      };
    }
  }

  if (aiResponse.sug1) validated.sug1 = String(aiResponse.sug1).trim();
  if (aiResponse.sug2) validated.sug2 = String(aiResponse.sug2).trim();

  return validated;
}

// ============================================
// Simple chatbot query (llmQuery)
// ============================================
const llmQuery = async (req, res) => {
  const { userMessage, botContext } = req.body;

  try {
    if (!userMessage || !botContext) {
      return res.status(400).json({
        error: "Missing required fields: userMessage and botContext",
      });
    }

    const UNIVERSAL_CONTEXT = `You're a friendly AI chatbot assistant.

**Response Rules:*
- Always use HTML: <p>, <strong>, <ul>, <li>, <br>
- NEVER use Markdown (no **, ##, - or 1.)
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

    const finalPrompt = UNIVERSAL_CONTEXT + botContext;

    const completion = await openai_NVIDIA.chat.completions.create({
      model: "mistralai/mistral-small-4-119b-2603",
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      top_p: 0.7,
      max_tokens: 2048,
      stream: false,
      reasoning_effort: "none",
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("Empty response from AI");

    return res.status(200).json({ data: response });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to process request",
      message: error.message,
    });
  }
};

// ============================================
// Optimized feedback data for AI analysis
// ============================================
async function optimizeFeedbackForAI(webUrl) {
  const TITLES = [
    "Bug Report",
    "Feature Request",
    "Improvement",
    "General Feedback",
    "Complaint",
  ];

  try {
    const feedbacks = await feedback.find({ webUrl }).lean();

    if (!feedbacks || feedbacks.length === 0) {
      return {
        webUrl,
        stats: { total: 0, unresolved: 0, resolved: 0, avgRating: "0.0", avgSeverity: "0.0" },
        titleCounts: {},
        severityBreakdown: {},
        feedbacks: {},
      };
    }

    const total = feedbacks.length;
    const stats = {
      total,
      unresolved: feedbacks.filter((f) => !f.status).length,
      resolved: feedbacks.filter((f) => f.status).length,
      avgRating: (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(1),
      avgSeverity: (feedbacks.reduce((s, f) => s + (f.severity || 0), 0) / total).toFixed(1),
    };

    const titleCounts = {};
    TITLES.forEach((title) => {
      titleCounts[title] = feedbacks.filter((f) => f.title === title).length;
    });

    const descByTitle = {};
    TITLES.forEach((title) => {
      const items = feedbacks
        .filter((f) => f.title === title)
        .map((f) => (f.description || "").trim());
      if (items.length > 0) descByTitle[title] = items;
    });

    const severityBreakdown = {
      critical: feedbacks.filter((f) => f.severity >= 5).length,
      high: feedbacks.filter((f) => f.severity === 4).length,
      medium: feedbacks.filter((f) => f.severity === 3).length,
      low: feedbacks.filter((f) => f.severity === 2).length,
      veryLow: feedbacks.filter((f) => f.severity <= 1).length,
    };

    return { webUrl, stats, titleCounts, severityBreakdown, feedbacks: descByTitle };
  } catch (error) {
    console.error(`Error optimizing feedback for ${webUrl}:`, error);
    return { webUrl, error: "Failed to fetch data" };
  }
}

// ============================================
// PHASE 1: Keyword-based Intent Extraction (FAST — 0 tokens)
// Falls back to AI only for ambiguous queries
// ============================================
function extractIntentKeyword(userPrompt, availableSites) {
  const lower = userPrompt.toLowerCase().trim();
  const filters = {};
  let needsAllData = false;
  let matched = false;

  // --- CATEGORY / TITLE DETECTION ---
  if (/\b(complaint|complaints)\b/.test(lower)) {
    filters.title = "Complaint"; matched = true;
  } else if (/\b(bug|bugs|bug\s*report|bug\s*reports)\b/.test(lower)) {
    filters.title = "Bug Report"; matched = true;
  } else if (/\b(feature\s*request|feature\s*requests|feature)\b/.test(lower)) {
    filters.title = "Feature Request"; matched = true;
  } else if (/\b(improvement|improvements)\b/.test(lower)) {
    filters.title = "Improvement"; matched = true;
  } else if (/\b(general\s*feedback)\b/.test(lower)) {
    filters.title = "General Feedback"; matched = true;
  }

  // --- SEVERITY DETECTION ---
  const severityPatterns = [
    { regex: /(?:severity|sev)\s*(?:>|>=|above|over|more\s*than|greater\s*than|gte)\s*(\d)/, op: "gte" },
    { regex: /(?:over|above|more\s*than|greater\s*than)\s*(\d)\s*severity/, op: "gte" },
    { regex: /severity\s*(\d)\s*\+/, op: "gte" },
    { regex: /(?:severity|sev)\s*(?:<|<=|below|under|less\s*than|lte)\s*(\d)/, op: "lte" },
    { regex: /(?:below|under|less\s*than)\s*(\d)\s*severity/, op: "lte" },
    { regex: /(?:severity|sev)\s*(?:=|==|equals?|is)\s*(\d)/, op: "eq" },
  ];
  for (const { regex, op } of severityPatterns) {
    const m = lower.match(regex);
    if (m) {
      filters.severity_op = op;
      filters.severity_val = parseInt(m[1]);
      matched = true;
      break;
    }
  }
  if (!filters.severity_op) {
    if (/\b(critical|urgent|emergency)\b/.test(lower)) {
      filters.severity_op = "gte"; filters.severity_val = 4; matched = true;
    } else if (/\b(high\s*severity)\b/.test(lower)) {
      filters.severity_op = "gte"; filters.severity_val = 4; matched = true;
    } else if (/\b(low\s*severity)\b/.test(lower)) {
      filters.severity_op = "lte"; filters.severity_val = 2; matched = true;
    }
  }

  // --- RATING DETECTION ---
  const ratingPatterns = [
    { regex: /(?:rating|rated|star|stars)\s*(?:>|>=|above|over|more\s*than|greater\s*than|gte)\s*(\d)/, op: "gte" },
    { regex: /(?:over|above|more\s*than|greater\s*than)\s*(\d)\s*(?:rating|star|stars)/, op: "gte" },
    { regex: /rating\s*(\d)\s*\+/, op: "gte" },
    { regex: /(?:rating|rated|star|stars)\s*(?:<|<=|below|under|less\s*than|lte)\s*(\d)/, op: "lte" },
    { regex: /(?:below|under|less\s*than)\s*(\d)\s*(?:rating|star|stars)/, op: "lte" },
    { regex: /(?:rating|rated)\s*(?:=|==|equals?|is)\s*(\d)/, op: "eq" },
  ];
  for (const { regex, op } of ratingPatterns) {
    const m = lower.match(regex);
    if (m) {
      filters.rating_op = op;
      filters.rating_val = parseInt(m[1]);
      matched = true;
      break;
    }
  }
  if (!filters.rating_op) {
    if (/\b(low\s*rating|bad\s*reviews?|poor\s*rating|worst|1\s*star)\b/.test(lower)) {
      filters.rating_op = "lte"; filters.rating_val = 2; matched = true;
    } else if (/\b(high\s*rating|good\s*reviews?|great\s*rating|best|5\s*star|top\s*rated)\b/.test(lower)) {
      filters.rating_op = "gte"; filters.rating_val = 4; matched = true;
    }
  }

  // --- STATUS DETECTION ---
  if (/\b(unresolved|open|pending|not\s*resolved|unsolved|active\s*issues?)\b/.test(lower)) {
    filters.status = false; matched = true;
  } else if (/\b(resolved|closed|fixed|done|completed|solved)\b/.test(lower)) {
    filters.status = true; matched = true;
  }

  // --- WEBSITE DETECTION ---
  let websites = ["all"];
  const matchedSites = availableSites.filter(site =>
    lower.includes(site.toLowerCase()) ||
    lower.includes(site.replace(/^https?:\/\//, "").toLowerCase())
  );
  if (matchedSites.length > 0) {
    websites = matchedSites;
    matched = true;
  }

  // --- FULL DATA DETECTION ---
  if (!matched) {
    const fullDataPatterns = /\b(overview|summarize|summary|evaluate|analyze|analysis|how('s| is| are)|all\s*data|everything|overall|general|report|tell\s*me\s*about|what('s| do)|dashboard)\b/;
    if (fullDataPatterns.test(lower)) needsAllData = true;
  }

  if (!matched && !needsAllData) return null;

  if (needsAllData) Object.keys(filters).forEach(k => delete filters[k]);

  return {
    websites,
    filters,
    needsAllData,
    _usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
}

// ============================================
// PHASE 1 Fallback: AI-based Intent Extraction
// Only called when keyword matching fails
// ============================================
async function extractIntentAI(userPrompt, availableSites) {
  const intentSystemPrompt = `Route user query to correct data. Return JSON only.
Sites: ${JSON.stringify(availableSites)}
Schema: title (EXACT values: "Bug Report","Feature Request","Improvement","General Feedback","Complaint"), rating(1-5), severity(1-5), status(bool:true=resolved,false=unresolved), webUrl
JSON: {"websites":["all"],"filters":{},"needsAllData":true}
filter keys: title, rating_op/rating_val, severity_op/severity_val, status (ops: eq/gte/lte/gt/lt)

Title mapping (user words → exact title value):
- bug/bugs/bug report/errors/issues/defects → "Bug Report"
- feature/feature request/request/wish/suggestion → "Feature Request"  
- improvement/improve/enhance/optimization → "Improvement"
- general/general feedback/feedback/comments/opinions → "General Feedback"
- complaint/complaints/dissatisfied/unhappy/bad experience → "Complaint"

needsAllData=true → filters MUST be {}. needsAllData=false → include filters.
General overview/summarize/evaluate ALL/analyze everything → needsAllData:true
Specific category/criteria mentioned → needsAllData:false + filters.`;

  try {
    const completion = await Promise.race([
      openai_NVIDIA.chat.completions.create({
        model: "mistralai/mistral-small-4-119b-2603",
        temperature: 0.1,
        top_p: 1.0,
        max_tokens: 256,
        reasoning_effort: "none",
        messages: [
          { role: "system", content: intentSystemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Intent extraction timeout")), 10000)
      ),
    ]);

    const result = completion.choices?.[0]?.message?.content;
    const usage = completion.usage || {};

    if (!result) {
      return { websites: ["all"], filters: {}, needsAllData: true, _usage: {} };
    }

    const parsed = extractCleanJSON(result);
    if (!parsed) {
      return { websites: ["all"], filters: {}, needsAllData: true, _usage: usage };
    }

    if (parsed.needsAllData === true && parsed.filters && Object.keys(parsed.filters).length > 0) {
      parsed.filters = {};
    }

    parsed._usage = usage;
    return parsed;
  } catch (error) {
    console.error("[Phase1] Intent extraction error:", error.message);
    return { websites: ["all"], filters: {}, needsAllData: true, _usage: {} };
  }
}

// ============================================
// PHASE 1: Main entry — Keyword first, AI fallback
// ============================================
async function extractIntent(userPrompt, availableSites, chatHistory) {
  const keywordResult = extractIntentKeyword(userPrompt, availableSites);
  if (keywordResult) return keywordResult;
  return extractIntentAI(userPrompt, availableSites, chatHistory);
}

// ============================================
// PHASE 2 Helper: Fetch filtered feedback from MongoDB
// ============================================
async function fetchFilteredFeedback(intent, availableSites) {
  const OP_MAP = { eq: "$eq", gte: "$gte", lte: "$lte", gt: "$gt", lt: "$lt" };
  const TITLES = ["Bug Report", "Feature Request", "Improvement", "General Feedback", "Complaint"];

  try {
    let targetSites;
    if (!intent.websites || intent.websites.includes("all") || intent.websites.length === 0) {
      targetSites = availableSites;
    } else {
      targetSites = intent.websites.filter(site =>
        availableSites.some(avail =>
          avail.toLowerCase().includes(site.toLowerCase()) ||
          site.toLowerCase().includes(avail.toLowerCase())
        )
      );
      if (targetSites.length === 0) targetSites = availableSites;
    }

    const filters = intent.filters || {};
    const query = { webUrl: { $in: targetSites } };

    if (filters.title) query.title = filters.title;

    if (filters.rating_op && filters.rating_val !== undefined) {
      const mongoOp = OP_MAP[filters.rating_op];
      if (mongoOp) query.rating = { [mongoOp]: Number(filters.rating_val) };
    }

    if (filters.severity_op && filters.severity_val !== undefined) {
      const mongoOp = OP_MAP[filters.severity_op];
      if (mongoOp) query.severity = { [mongoOp]: Number(filters.severity_val) };
    }

    if (filters.status !== undefined && filters.status !== null) {
      query.status = filters.status;
    }

    const feedbacks = await feedback.find(query).sort({ createdOn: -1 }).lean();

    // Group by site
    const bySite = {};
    for (const fb of feedbacks) {
      if (!bySite[fb.webUrl]) bySite[fb.webUrl] = [];
      bySite[fb.webUrl].push(fb);
    }

    const result = [];
    for (const [site, siteFeedbacks] of Object.entries(bySite)) {
      const total = siteFeedbacks.length;
      const stats = {
        total,
        unresolved: siteFeedbacks.filter(f => !f.status).length,
        resolved: siteFeedbacks.filter(f => f.status).length,
        avgRating: (siteFeedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(1),
        avgSeverity: (siteFeedbacks.reduce((s, f) => s + (f.severity || 0), 0) / total).toFixed(1),
      };

      const titleCounts = {};
      TITLES.forEach(title => {
        const count = siteFeedbacks.filter(f => f.title === title).length;
        if (count > 0) titleCounts[title] = count;
      });

      const descByTitle = {};
      TITLES.forEach(title => {
        const items = siteFeedbacks
          .filter(f => f.title === title)
          .map(f => (f.description || "").trim());
        if (items.length > 0) descByTitle[title] = items;
      });

      result.push({
        webUrl: site,
        stats,
        titleCounts,
        statusBreakdown: {
          resolved: {
            count: stats.resolved,
            descriptions: siteFeedbacks.filter(f => f.status).map(f => (f.description || "").trim()).filter(Boolean),
          },
          unresolved: {
            count: stats.unresolved,
            descriptions: siteFeedbacks.filter(f => !f.status).map(f => (f.description || "").trim()).filter(Boolean),
          },
        },
        feedbacks: descByTitle,
        _filtered: true,
      });
    }

    return {
      data: result,
      query,
      totalMatched: feedbacks.length,
      sitesQueried: targetSites,
    };
  } catch (error) {
    console.error("[Phase2a] Filtered fetch error:", error);
    return { data: [], query: {}, totalMatched: 0, sitesQueried: [], error: error.message };
  }
}

// Email generation instructions - Only used when requested
const EMAIL_INSTRUCTIONS = `
2. "reports_or_emails" field (CONDITIONAL - ENABLED):
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
     <p style="margin:0;"><strong>\${username}</strong></p>
     <p style="margin:0;"><a href="mailto:\${userMail}">\${userMail}</a></p>
     <p style="margin:0;color:#666;">Management Head</p>
   </div>
`;

// Standard instructions for normal chat
const BASE_INSTRUCTIONS = `
2. "reports_or_emails" field:
   - DO NOT generate this field.
   - User has NOT requested an email.
   - Provide only analysis and suggestions.
`;

// ============================================
// askAI — Two-Phase Pipeline
// Phase 1: Extract intent (which site, what filters)
// Phase 2: Fetch filtered data → AI analysis
// ============================================
const askAI = async (req, res) => {
  const pipelineStart = Date.now();

  try {
    if (!req.body || !req.body.userPrompt) {
      return res.status(400).json({ error: "Missing required field: userPrompt" });
    }

    const userPrompt = String(req.body.userPrompt);
    const userPromptLower = userPrompt.toLowerCase();

    const isEmailRequested = [
      "email", "mail", "send", "draft", "write", "notify", "alert", "report", "message",
    ].some(keyword => userPromptLower.includes(keyword));

    const chat = (req.body.aiResponse || [])
      .filter((c) => c && typeof c === "object")
      .map((c) => ({
        role: c.role || "assistant",
        content: String(c.content || ""),
      }))
      .concat([{ role: "user", content: userPrompt }]);

    const websites = await getUserAccessibleWebsites(req.user.id);
    const availableSites = websites.sites || [];

    const username = req.user?.name || "Unknown User";
    const userMail = req.user?.email || "Unknown Email";

    // =============================================
    // PHASE 1: Extract intent (lightweight AI call)
    // =============================================
    const phase1Start = Date.now();
    const intent = await extractIntent(userPrompt, availableSites, req.body.aiResponse);
    const phase1Usage = intent._usage || {};
    delete intent._usage;
    const phase1Time = Date.now() - phase1Start;

    // =============================================
    // PHASE 2: Fetch data based on intent
    // =============================================
    let contextData;
    let dataMode;
    let filterSummary = "";
    const phase2Start = Date.now();

    if (intent.needsAllData) {
      dataMode = "full";
      filterSummary = "Full analysis across all sites";

      const optimizedData = [];
      for (const site of availableSites) {
        if (site) optimizedData.push(await optimizeFeedbackForAI(site));
      }
      contextData = optimizedData;
    } else {
      dataMode = "filtered";
      const filteredResult = await fetchFilteredFeedback(intent, availableSites);
      contextData = filteredResult.data;

      const parts = [];
      if (intent.filters?.title) parts.push(`Category: ${intent.filters.title}`);
      if (intent.filters?.rating_op) parts.push(`Rating ${intent.filters.rating_op} ${intent.filters.rating_val}`);
      if (intent.filters?.severity_op) parts.push(`Severity ${intent.filters.severity_op} ${intent.filters.severity_val}`);
      if (intent.filters?.status !== undefined) parts.push(intent.filters.status ? "Resolved" : "Unresolved");
      const sitePart = intent.websites?.includes("all") ? "all sites" : (intent.websites || []).join(", ");
      filterSummary = `Filtered: ${parts.length > 0 ? parts.join(", ") : "specific query"} from ${sitePart} (${filteredResult.totalMatched} results)`;
    }

    const phase2Time = Date.now() - phase2Start;

    const data = JSON.stringify(contextData)
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");

    // =============================================
    // PHASE 2b: AI Analysis call
    // =============================================
    const dataContextNote =
      dataMode === "filtered"
        ? `\nNOTE: The data below is FILTERED based on user's query. ${filterSummary}. Analyze ONLY this filtered subset.`
        : `\nNOTE: You have the complete feedback data across all user's sites.`;

    const systemInstructions = `Respond ONLY with valid JSON. No other text.
You analyze feedback data and help the user. User: ${username} (${userMail}), Role: Management Head.
Data Mode: ${dataMode.toUpperCase()}. ${dataContextNote}
Data: ${data}

JSON format:
{"response":"<p>2-3 sentence HTML analysis citing data</p>","reports_or_emails":{"mail":{"subject":"...","body":"<html>...</html>"}},"sug1":"Button Label","sug2":"Button Label"}

Rules:
- response: HTML only (<p>,<strong>,<ul>,<li>,<br>). No markdown. Cite specific numbers. ALWAYS include a meaningful response.
- sug1/sug2: 3-5 word button labels (REQUIRED)
${isEmailRequested
  ? `- reports_or_emails: Generate ONLY if user explicitly asks for email/report/notify. Include signature with ${username}, ${userMail}, Management Head.
- When generating an email, set response to a friendly message like: "<p>Here's your email, ready to send! 📧 I've drafted it based on the feedback data. You can edit it before sending.</p>"`
  : `- reports_or_emails: OMIT this field entirely.`}
- Output ONLY valid JSON. No code blocks, no extra text.`;

    const analysisStart = Date.now();
    const completion = await Promise.race([
      openai_NVIDIA.chat.completions.create({
        model: "mistralai/mistral-small-4-119b-2603",
        temperature: 0.6,
        top_p: 1.0,
        max_tokens: 16384,
        reasoning_effort: "high",
        messages: [
          { role: "system", content: systemInstructions },
          ...chat,
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API timeout")), 60000)
      ),
    ]);

    const analysisTime = Date.now() - analysisStart;
    const result = completion.choices?.[0]?.message?.content;
    const usage2 = completion.usage || {};

    if (!result) throw new Error("Empty response from AI");

    const cleanResult = extractCleanJSON(result);
    const validatedResult = validateAIResponse(cleanResult);

    const totalTime = Date.now() - pipelineStart;
    const totalTokens =
      (phase1Usage.prompt_tokens || 0) + (phase1Usage.completion_tokens || 0) +
      (usage2.prompt_tokens || 0) + (usage2.completion_tokens || 0);

    return res.status(200).json({
      response: validatedResult,
      data: contextData,
      meta: {
        mode: dataMode,
        filterSummary,
        responseTime: totalTime,
        tokens: {
          phase1: phase1Usage.total_tokens || 0,
          phase2b: usage2.total_tokens || 0,
          total: totalTokens,
        },
        intent: {
          websites: intent.websites,
          filters: intent.filters,
          needsAllData: intent.needsAllData,
        },
      },
    });
  } catch (error) {
    console.error("[askAI] Pipeline error:", error.message);

    if (error.message === "API timeout") {
      return res.status(504).json({
        response: {
          response: "<p>Request timed out. Please try again.</p>",
          error: "timeout",
        },
      });
    }

    return res.status(500).json({
      response: {
        response: "<p>Sorry, the AI is under maintenance right now. Please try again later.</p>",
        error: "service_unavailable",
      },
    });
  }
};

module.exports = { llmQuery, askAI };
