const { OpenAI } = require("openai");
const { getUserAccessibleWebsites } = require("../controllers/feebackController");
const feedback = require("../models/feedback");

const openai_NVIDIA = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const KEY_MAP = {
  "Bug Report": "bugs", "Feature Request": "features",
  "Complaint": "complaints", "Improvement": "improve", "General Feedback": "general",
};

// ============================================
// Helpers
// ============================================

function extractCleanJSON(text) {
  if (!text || typeof text !== "string") {
    return { error: "empty_response", response: "<p>Received empty response from AI.</p>" };
  }

  try {
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Direct parse — devstral returns clean JSON without code fences
    if (text.startsWith("{") || text.startsWith("[")) {
      try { return JSON.parse(text); } catch { /* fall through */ }
    }

    if (text.startsWith("<") && !text.includes("{")) {
      return { response: text, sug1: "Tell me more about the feedback", sug2: "Show me specific team issues" };
    }

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        response: text.includes("<") ? text : `<p>${text}</p>`,
        sug1: "Analyze the feedback data",
        sug2: "Show key insights",
      };
    }

    let jsonString = cleanJSONString(jsonMatch[1] || jsonMatch[2] || jsonMatch[0]);
    try {
      return JSON.parse(jsonString);
    } catch {
      return rescueParseJSON(jsonString, text);
    }
  } catch {
    return { error: "extraction_failure", response: "<p>Failed to process AI response.</p>", raw: text.substring(0, 500) };
  }
}

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
    .replace(/\\([^"\\/bfnrtu\d])/g, "$1")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
}

function rescueParseJSON(jsonString, originalText) {
  try {
    const start = jsonString.indexOf("{");
    const end = jsonString.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(jsonString.slice(start, end + 1));
    }
  } catch { /* silent — fall through to default */ }

  return {
    response: originalText.includes("<") ? originalText : `<p>${originalText}</p>`,
    sug1: "Analyze feedback trends",
    sug2: "Show critical issues",
  };
}

function validateAIResponse(aiResponse) {
  if (aiResponse.error) {
    return { response: aiResponse.response || "<p>Unable to process AI response.</p>", error: aiResponse.error };
  }

  const hasEmail = aiResponse.reports_or_emails?.mail?.subject && aiResponse.reports_or_emails?.mail?.body;

  const validated = {
    response: aiResponse.response || (hasEmail
      ? "<p>Here's your email, ready to send! 📧 Review and edit it before sending.</p>"
      : "<p>Here's what I found based on your data.</p>"),
  };

  const mail = aiResponse.reports_or_emails?.mail;
  if (mail?.subject && mail?.body) {
    validated.reports_or_emails = {
      mail: { subject: String(mail.subject).trim(), body: String(mail.body).trim() },
    };
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
      return res.status(400).json({ error: "Missing required fields: userMessage and botContext" });
    }

    // Simple onboarding detection — no complex regex, just plain string check
    const msg = userMessage.toLowerCase().trim();
    const isOnboarding = msg.includes("new here") || 
                         msg.includes("im new") || 
                         msg.includes("i'm new") || 
                         msg.includes("just joined") || 
                         msg.includes("getting started") || 
                         msg.includes("first time") ||
                         msg.includes("what can i do");

    console.log(`[llmQuery] userMessage="${userMessage}" | isOnboarding=${isOnboarding}`);

    let messages, temperature;

    if (isOnboarding) {
      const onboardingPrompt = `Rules:

Output ONLY USING HTML TAGS NO FULL HTML

Always use bullet points (<ul><li>) where applicable.

Include ALL navigation items as <li> in Quick Links.

Write a 1–2 sentence intro.

Include 3–4 meaningful features only.

Use ONE contact email.

Do NOT add anything outside the template.

Template:

Welcome to [NAME]! 🎉

[1–2 sentence description]

🔗 Quick Links:

[Page] — [short description] → [/path]

✨ Top Features:

[Feature]

📬 [email]

Platform Info:
${botContext}

USER: ${userMessage}`;

      messages = [{ role: "user", content: onboardingPrompt }];
      temperature = 0.15;
      console.log(`[llmQuery] ONBOARDING TRIGGERED — prompt length: ${onboardingPrompt.length} chars`);
    } else {
      messages = [
        {
          role: "system",
          content: `You are a helpful website assistant. Answer ONLY from the platform info below.

STRICT FORMAT RULES — FOLLOW THESE OR FAIL:
1. Output HTML only. Use <p>, <strong>, <ul>, <li>, <ol>, <em>. NO Markdown ever.
2. ANY time you list data (courses, features, links, prices, people, options) — you MUST use <ul><li>. NEVER write them as a paragraph or sentence.
3. Put key info in <strong>: names, prices, ratings, paths.
4. Put URL paths in <em>: e.g. <em>/courses/1</em>
5. Keep each <li> to ONE line — name, key details, path.
6. Max 1-2 emojis per response. Be brief.
7. If you don't know → "<p>I don't have that info right now 😅</p>"

Example of CORRECT response to "do you have react courses?":
<p>Yes! Here's what we have:</p>
<ul>
<li><strong>Adv React Patterns</strong> — Michael Chen, <strong>$79.99</strong>, ⭐4.9 → <em>/courses/2</em></li>
</ul>

Example of WRONG response (NEVER do this):
"Yes! We have an Advanced React Patterns course by Michael Chen for $79.99 with a 4.9 rating."

Platform Info:
${botContext}`
        },
        { role: "user", content: userMessage }
      ];
      temperature = 0.15;
      console.log(`[llmQuery] REGULAR QUERY — userMessage: "${userMessage}"`);
    }

    console.log(`[llmQuery] Sending to model: mistralai/mistral-large-3-675b-instruct-2512`);

    const completion = await openai_NVIDIA.chat.completions.create({
      model: "mistralai/mistral-large-3-675b-instruct-2512",
      messages,
      temperature,
      top_p: 1.00,
      max_tokens: 2048,
      frequency_penalty: 0.00,
      presence_penalty: 0.00,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    console.log(`[llmQuery] Response (first 200 chars): ${response?.substring(0, 200)}`);
    if (!response) throw new Error("Empty response from AI");

    return res.status(200).json({ data: response });
  } catch (error) {
    console.error(`[llmQuery] ERROR: ${error.message}`);
    return res.status(500).json({ error: "Failed to process request", message: error.message });
  }
};

// ============================================
// Build optimized per-site feedback payload
// ============================================
function buildCategoryPayload(feedbackItems, toEntry) {
  const categories = {};
  for (const [title, key] of Object.entries(KEY_MAP)) {
    const group = feedbackItems.filter((f) => f.title === title);
    if (!group.length) continue;
    const open = group.filter((f) => !f.status);
    const resolved = group.filter((f) => f.status);
    const n = group.length;
    categories[key] = {
      n,
      sev: (group.reduce((s, f) => s + (f.severity || 0), 0) / n).toFixed(1),
      rat: (group.reduce((s, f) => s + (f.rating || 0), 0) / n).toFixed(1),
      open: open.length,
      d_open: open.slice(0, 20).map(toEntry).filter((e) => e.desc),
      d_resolved: resolved.slice(0, 20).map(toEntry).filter((e) => e.desc),
    };
  }
  return categories;
}

const toEntry = (f) => {
  const e = { desc: (f.description || "").trim() };
  if (f.email) e.email = f.email;
  if (f.name) e.name = f.name;
  return e;
};

async function optimizeFeedbackForAI(webUrl) {
  try {
    const feedbacks = await feedback.find({ webUrl }).lean();
    if (!feedbacks?.length) {
      return { [webUrl]: { stats: { total: 0, resolved: 0, unresolved: 0, avgRating: "0.0", avgSev: "0.0" } } };
    }

    const total = feedbacks.length;
    const resolved = feedbacks.filter((f) => f.status).length;
    const stats = {
      total,
      resolved,
      unresolved: total - resolved,
      avgRating: (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(1),
      avgSev: (feedbacks.reduce((s, f) => s + (f.severity || 0), 0) / total).toFixed(1),
    };

    return { [webUrl]: { stats, ...buildCategoryPayload(feedbacks, toEntry) } };
  } catch {
    return { [webUrl]: { error: "Failed to fetch data" } };
  }
}

// ============================================
// PHASE 1: Keyword-based Intent Extraction
// ============================================
function extractIntentKeyword(userPrompt, availableSites) {
  const lower = userPrompt.toLowerCase().trim();
  const filters = {};
  let needsAllData = false;
  let matched = false;

  // Category
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

  // Severity
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
    if (m) { filters.severity_op = op; filters.severity_val = parseInt(m[1]); matched = true; break; }
  }
  if (!filters.severity_op) {
    if (/\b(critical|urgent|emergency)\b/.test(lower)) { filters.severity_op = "gte"; filters.severity_val = 4; matched = true; }
    else if (/\b(high\s*severity)\b/.test(lower)) { filters.severity_op = "gte"; filters.severity_val = 4; matched = true; }
    else if (/\b(low\s*severity)\b/.test(lower)) { filters.severity_op = "lte"; filters.severity_val = 2; matched = true; }
  }

  // Rating
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
    if (m) { filters.rating_op = op; filters.rating_val = parseInt(m[1]); matched = true; break; }
  }
  if (!filters.rating_op) {
    if (/\b(low\s*rating|bad\s*reviews?|poor\s*rating|worst|1\s*star)\b/.test(lower)) { filters.rating_op = "lte"; filters.rating_val = 2; matched = true; }
    else if (/\b(high\s*rating|good\s*reviews?|great\s*rating|best|5\s*star|top\s*rated)\b/.test(lower)) { filters.rating_op = "gte"; filters.rating_val = 4; matched = true; }
  }

  // Status
  if (/\b(unresolved|open|pending|not\s*resolved|unsolved|active\s*issues?)\b/.test(lower)) {
    filters.status = false; matched = true;
  } else if (/\b(resolved|closed|fixed|done|completed|solved)\b/.test(lower)) {
    filters.status = true; matched = true;
  }

  // Website
  let websites = ["all"];
  const matchedSites = availableSites.filter((site) =>
    lower.includes(site.toLowerCase()) ||
    lower.includes(site.replace(/^https?:\/\//, "").toLowerCase())
  );
  if (matchedSites.length > 0) { websites = matchedSites; matched = true; }

  // Full data
  if (!matched && /\b(overview|summarize|summary|evaluate|analyze|analysis|how('s| is| are)|all\s*data|everything|overall|general|report|tell\s*me\s*about|what('s| do)|dashboard)\b/.test(lower)) {
    needsAllData = true;
  }

  if (!matched && !needsAllData) return null;
  if (needsAllData) Object.keys(filters).forEach((k) => delete filters[k]);

  return { websites, filters, needsAllData, _usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
}

// ============================================
// PHASE 1 Fallback: AI-based Intent Extraction
// ============================================
async function extractIntentAI(userPrompt, availableSites) {
  const intentSystemPrompt = `Route user query to correct data. Return JSON only.
Sites: ${JSON.stringify(availableSites)}
Schema: title (EXACT: "Bug Report","Feature Request","Improvement","General Feedback","Complaint"), rating(1-5), severity(1-5), status(bool:true=resolved,false=unresolved)
JSON: {"websites":["all"],"filters":{},"needsAllData":true}
filter keys: title, rating_op/rating_val, severity_op/severity_val, status (ops: eq/gte/lte/gt/lt)
Title mapping: bug/errors/defects→"Bug Report", feature/wish/suggestion→"Feature Request", improve/enhance→"Improvement", general/comments→"General Feedback", complaint/unhappy→"Complaint"
needsAllData=true → filters MUST be {}. Specific criteria → needsAllData:false + filters.`;

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
      new Promise((_, reject) => setTimeout(() => reject(new Error("Intent extraction timeout")), 10000)),
    ]);

    const result = completion.choices?.[0]?.message?.content;
    const usage = completion.usage || {};
    if (!result) return { websites: ["all"], filters: {}, needsAllData: true, _usage: {} };

    const parsed = extractCleanJSON(result);
    if (!parsed) return { websites: ["all"], filters: {}, needsAllData: true, _usage: usage };

    if (parsed.needsAllData && parsed.filters && Object.keys(parsed.filters).length > 0) {
      parsed.filters = {};
    }
    parsed._usage = usage;
    return parsed;
  } catch {
    return { websites: ["all"], filters: {}, needsAllData: true, _usage: {} };
  }
}

async function extractIntent(userPrompt, availableSites) {
  return extractIntentKeyword(userPrompt, availableSites) ?? extractIntentAI(userPrompt, availableSites);
}

// ============================================
// PHASE 2 Helper: Fetch filtered feedback
// ============================================
const OP_MAP = { eq: "$eq", gte: "$gte", lte: "$lte", gt: "$gt", lt: "$lt" };

async function fetchFilteredFeedback(intent, availableSites) {
  try {
    let targetSites = availableSites;
    if (intent.websites && !intent.websites.includes("all") && intent.websites.length > 0) {
      const matched = intent.websites.filter((site) =>
        availableSites.some((avail) =>
          avail.toLowerCase().includes(site.toLowerCase()) ||
          site.toLowerCase().includes(avail.toLowerCase())
        )
      );
      if (matched.length > 0) targetSites = matched;
    }

    const filters = intent.filters || {};
    const query = { webUrl: { $in: targetSites } };
    if (filters.title) query.title = filters.title;
    if (filters.rating_op && filters.rating_val !== undefined) {
      const op = OP_MAP[filters.rating_op];
      if (op) query.rating = { [op]: Number(filters.rating_val) };
    }
    if (filters.severity_op && filters.severity_val !== undefined) {
      const op = OP_MAP[filters.severity_op];
      if (op) query.severity = { [op]: Number(filters.severity_val) };
    }
    if (filters.status !== undefined && filters.status !== null) {
      query.status = filters.status;
    }

    const feedbacks = await feedback.find(query).sort({ createdOn: -1 }).lean();

    const bySite = {};
    for (const fb of feedbacks) {
      (bySite[fb.webUrl] ??= []).push(fb);
    }

    const result = {};
    for (const [site, items] of Object.entries(bySite)) {
      const total = items.length;
      const resolved = items.filter((f) => f.status).length;
      result[site] = {
        stats: {
          total, resolved, unresolved: total - resolved,
          avgRating: (items.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(1),
          avgSev: (items.reduce((s, f) => s + (f.severity || 0), 0) / total).toFixed(1),
        },
        ...buildCategoryPayload(items, toEntry),
      };
    }

    return { data: result, query, totalMatched: feedbacks.length, sitesQueried: targetSites };
  } catch (error) {
    return { data: [], query: {}, totalMatched: 0, sitesQueried: [], error: error.message };
  }
}

// ============================================
// askAI — Two-Phase Pipeline
// ============================================
const askAI = async (req, res) => {
  const pipelineStart = Date.now();

  try {
    if (!req.body?.userPrompt) {
      return res.status(400).json({ error: "Missing required field: userPrompt" });
    }

    const userPrompt = String(req.body.userPrompt);
    const isEmailRequested = ["email", "mail", "send", "draft", "write", "notify", "alert", "report", "message"]
      .some((kw) => userPrompt.toLowerCase().includes(kw));

    const chat = (req.body.aiResponse || [])
      .filter((c) => c && typeof c === "object")
      .map((c) => ({ role: c.role || "assistant", content: String(c.content || "") }))
      .concat([{ role: "user", content: userPrompt }]);

    const websites = await getUserAccessibleWebsites(req.user.id);
    const availableSites = websites.sites || [];
    const username = req.user?.name || "Unknown User";
    const userMail = req.user?.email || "Unknown Email";

    // Phase 1: Intent
    const intent = await extractIntent(userPrompt, availableSites);
    const phase1Usage = intent._usage || {};
    delete intent._usage;

    // Phase 2: Fetch data
    let contextData, dataMode, filterSummary;

    if (intent.needsAllData) {
      dataMode = "full";
      filterSummary = "Full analysis across all sites";
      const results = await Promise.all(availableSites.filter(Boolean).map(optimizeFeedbackForAI));
      contextData = Object.assign({}, ...results);
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
      filterSummary = `Filtered: ${parts.length ? parts.join(", ") : "specific query"} from ${sitePart} (${filteredResult.totalMatched} results)`;
    }

    const data = JSON.stringify(contextData).replace(/`/g, "\\`").replace(/\$/g, "\\$");

    const dataContextNote = dataMode === "filtered"
      ? `\nNOTE: The data below is FILTERED based on user's query. ${filterSummary}. Analyze ONLY this filtered subset.`
      : `\nNOTE: You have the complete feedback data across all user's sites.`;

    const systemInstructions = `Data keys: bugs/features/complaints/improve/general. Per category: n=count, sev=avg severity, rat=avg rating, open=unresolved count, d_open=unresolved items (each: desc + email/name if present), d_resolved=resolved items.
Respond ONLY with valid JSON. No other text.
You analyze feedback data and help the user. User: ${username} (${userMail}), Role: Management Head.
Data Mode: ${dataMode.toUpperCase()}. ${dataContextNote}
Data: ${data}

JSON format:
{"response":"<p>2-3 sentence HTML analysis citing data</p>","reports_or_emails":{"mail":{"subject":"...","body":"<html>...</html>"}},"sug1":"Button Label","sug2":"Button Label"}

Rules:
- response: HTML only (<p>,<strong>,<ul>,<li>,<br>). No markdown. Cite specific numbers. ALWAYS include a meaningful response.
- sug1/sug2: 3-5 word button labels (REQUIRED)
${isEmailRequested
      ? `- reports_or_emails: Generate ONLY if user explicitly asks for email/report/notify. Include signature with ${username}, ${userMail}, Management Head.\n- When generating an email, set response to a friendly message like: "<p>Here's your email, ready to send! 📧 I've drafted it based on the feedback data. You can edit it before sending.</p>"`
      : `- reports_or_emails: OMIT this field entirely.`}
- Output ONLY valid JSON. No code blocks, no extra text.`;

    // Phase 2b: AI Analysis (streaming)
    let result = "";
    let usage2 = {};

    const stream = await Promise.race([
      openai_NVIDIA.chat.completions.create({
        model: "mistralai/devstral-2-123b-instruct-2512",
        temperature: 0.15,
        top_p: 0.95,
        max_tokens: 8192,
        stream: true,
        stream_options: { include_usage: true },
        messages: [{ role: "system", content: systemInstructions }, ...chat],
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("API timeout")), 60000)),
    ]);

    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || "";
      if (chunk.usage) usage2 = chunk.usage;
    }

    if (!result) throw new Error("Empty response from AI");

    const validatedResult = validateAIResponse(extractCleanJSON(result));
    const totalTokens = (phase1Usage.prompt_tokens || 0) + (phase1Usage.completion_tokens || 0) +
      (usage2.prompt_tokens || 0) + (usage2.completion_tokens || 0);

    return res.status(200).json({
      response: validatedResult,
      data: contextData,
      meta: {
        mode: dataMode,
        filterSummary,
        responseTime: Date.now() - pipelineStart,
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
    if (error.message === "API timeout") {
      return res.status(504).json({ response: { response: "<p>Request timed out. Please try again.</p>", error: "timeout" } });
    }
    return res.status(500).json({ response: { response: "<p>Sorry, the AI is under maintenance right now. Please try again later.</p>", error: "service_unavailable" } });
  }
};

module.exports = { llmQuery, askAI };
