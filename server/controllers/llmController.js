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

/**
 * Detects whether the user message is an onboarding/welcome intent.
 * Covers greetings, "new here", "what is this", "help me get started", etc.
 */
function isOnboardingIntent(msg) {
  const lower = msg.toLowerCase().trim();
  const onboardingPatterns = [
    // Direct "new" signals
    "new here", "im new", "i'm new", "i am new", "just joined",
    "first time", "getting started", "get started",
    // Exploratory / what-is-this signals
    "what is this", "what's this", "whats this",
    "what can i do", "what do you do", "what does this do",
    "what can you do", "what do you offer",
    "what is this website", "what is this site", "what is this platform",
    "tell me about this", "tell me about yourself",
    // Help / guide signals
    "help me", "guide me", "show me around", "walk me through",
    "where do i start", "where should i start", "how does this work",
    "how do i use", "how to use",
    // Generic greetings that imply exploration
    "hello", "hi there", "hey there", "howdy",
  ];

  // Exact-match short greetings (avoid false positives on longer messages)
  const exactGreetings = ["hi", "hey", "hello", "yo", "sup", "hola", "hii", "hiii", "namaste"];
  if (exactGreetings.includes(lower)) return true;

  return onboardingPatterns.some((p) => lower.includes(p));
}

const llmQuery = async (req, res) => {
  const { userMessage, botContext } = req.body;

  try {
    if (!userMessage || !botContext) {
      return res.status(400).json({ error: "Missing required fields: userMessage and botContext" });
    }

    const onboarding = isOnboardingIntent(userMessage);
    console.log(`[llmQuery] userMessage="${userMessage}" | isOnboarding=${onboarding}`);

    let messages, temperature;

    if (onboarding) {
      // ── ONBOARDING PROMPT ──────────────────────────────────────
      // Generic — works with ANY botContext. Parses the context to
      // extract site name, nav links, features, and contact info.
      const onboardingSystemPrompt = `You are a friendly website assistant. The user just arrived or greeted you.
Your job: give them a warm, structured onboarding response using ONLY the platform info provided below.

═══ STRICT RULES ═══
1. Output HTML only (<p>, <strong>, <ul>, <li>, <a>, <br>). NEVER use Markdown.
2. Follow the EXACT structure below — do NOT skip or reorder sections.
3. Extract ALL information from the Platform Info. Do NOT invent or hallucinate data.
4. Navigation paths MUST be clickable <a> links: e.g. <a href="/courses">/courses</a>
5. Keep it concise — no filler text, no paragraphs of fluff.
6. Max 2-3 emojis total. Be professional yet warm.

═══ RESPONSE STRUCTURE (follow this order) ═══

SECTION 1 — GREETING
<p><strong>Welcome to [SITE NAME]! 👋</strong></p>
<p>[1–2 sentence summary of what the platform does, extracted from context]</p>

SECTION 2 — QUICK NAVIGATION
<p><strong>🔗 Quick Links:</strong></p>
<ul>
  <li><strong>[Page Name]</strong> — [what user finds there] → <a href="/path">/path</a></li>
  ... (list ALL nav items from context)
</ul>

SECTION 3 — TOP FEATURES (pick 3-4 most useful from context)
<p><strong>✨ What You Can Do:</strong></p>
<ul>
  <li>[Feature/highlight with a brief one-line value prop]</li>
  ...
</ul>

SECTION 4 — CONTACT (only if contact info exists in context)
<p><strong>📬 Need Help?</strong> Reach out at <strong>[email]</strong></p>

═══ IMPORTANT ═══
- If the context has courses, show 1–2 top-rated ones as highlights (not all).
- If the context has mentors, mention mentorship availability as a feature.
- If the context has community/events, mention community as a feature.
- ALWAYS end with a helpful closing like: <p>Feel free to ask me anything — I'm here to help! 😊</p>

Platform Info:
${botContext}`;

      messages = [
        { role: "system", content: onboardingSystemPrompt },
        { role: "user", content: userMessage },
      ];
      temperature = 0.2;
      console.log(`[llmQuery] ONBOARDING TRIGGERED — prompt length: ${onboardingSystemPrompt.length} chars`);
    } else {
      // ── GENERAL QUERY PROMPT ───────────────────────────────────
      // Always returns structured bullet points with navigation links.
      const generalSystemPrompt = `You are a helpful and precise website assistant. Answer the user's question using ONLY the platform info below.

═══ ABSOLUTE FORMAT RULES — VIOLATING THESE IS A FAILURE ═══

1. Output HTML tags only: <p>, <strong>, <ul>, <li>, <ol>, <a>, <br>. NEVER use Markdown (no **, no ##, no -).
2. EVERY response MUST use <ul><li> bullet points. NEVER answer in plain paragraph form.
   - Listing items (courses, people, events, prices)? → <ul><li> for EACH item.
   - Comparing options? → <ul><li> for EACH option.
   - Explaining steps? → <ol><li> numbered steps.
   - Even single-item answers → wrap in <ul><li>.
3. ALWAYS include clickable <a> links for navigation: e.g. → <a href="/courses/2">/courses/2</a>
   - If the answer relates to a page, ALWAYS append the relevant clickable link.
   - If multiple items, EACH <li> must have its own <a href> link.
   - NEVER use <em> for paths. ALWAYS use <a href="/path">.
4. Key data in <strong>: names, prices, ratings, counts, emails.
5. Start with a short 1-line <p> intro sentence, then immediately go to bullet points.
6. Max 2 emojis per response. Be concise — no filler.
7. If info is not in the context → "<p>I don't have that info right now 😅</p>"

═══ RESPONSE PATTERN (always follow) ═══

<p>[1-line direct answer to the question]</p>
<ul>
  <li><strong>[Item/Name]</strong> — [key details] → <a href="/path">/path</a></li>
  ...
</ul>
<p>[Optional: 1-line follow-up suggestion, e.g. "Browse all courses at <a href="/courses">/courses</a>"]</p>

═══ EXAMPLES OF CORRECT RESPONSES ═══

Q: "Do you have React courses?"
<p>Yes! Here's what we have for React:</p>
<ul>
  <li><strong>Adv React Patterns</strong> — Michael Chen, <strong>$79.99</strong>, ⭐4.9, 8.4k students → <a href="/courses/2">/courses/2</a></li>
</ul>
<p>See all courses at <a href="/courses">/courses</a></p>

Q: "How can I get mentored?"
<p>We offer 1-on-1 video mentorship sessions! Here are our mentors:</p>
<ul>
  <li><strong>Alice Chen</strong> — Sr. Frontend @Meta, React & System Design, ⭐4.9 → <a href="/mentorship">/mentorship</a></li>
  <li><strong>David Kim</strong> — Staff Backend @Stripe, Node & Go, ⭐5.0 → <a href="/mentorship">/mentorship</a></li>
</ul>
<p>Book a session at <a href="/mentorship">/mentorship</a></p>

Q: "What's the cheapest course?"
<p>Here's the most affordable option:</p>
<ul>
  <li><strong>UI/UX for Devs</strong> — Emily Davis, <strong>$69.99</strong>, ⭐4.9, 15k students → <a href="/courses/4">/courses/4</a></li>
</ul>
<p>Compare all courses at <a href="/courses">/courses</a></p>

═══ EXAMPLES OF WRONG RESPONSES (NEVER DO THIS) ═══
✗ "We have an Advanced React Patterns course by Michael Chen for $79.99 with a 4.9 rating."
✗ Using ** for bold instead of <strong>
✗ Listing items in a comma-separated sentence instead of <ul><li>
✗ Using <em>/path</em> instead of <a href="/path">
✗ Forgetting to include the navigation link

Platform Info:
${botContext}`;

      messages = [
        { role: "system", content: generalSystemPrompt },
        { role: "user", content: userMessage },
      ];
      temperature = 0.15;
      console.log(`[llmQuery] REGULAR QUERY — userMessage: "${userMessage}"`);
    }

    console.log(`[llmQuery] Sending to model: mistralai/devstral-2-123b-instruct-2512`);

    const completion = await openai_NVIDIA.chat.completions.create({
      model: "mistralai/devstral-2-123b-instruct-2512",
      messages,
      temperature,
      top_p: 0.95,
      max_tokens: 8192,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    console.log(`[llmQuery] Response (first 300 chars): ${response?.substring(0, 300)}`);
    if (!response) throw new Error("Empty response from AI");

    // Strip any <think>...</think> blocks some models return
    const cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    return res.status(200).json({ data: cleanResponse });
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
