const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.NV_API_KEY || "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 4096,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are an intelligent feedback and reporting assistant. Respond with clean JSON only. Never include reasoning, explanations, or thinking steps.",
      },
      {
        role: "user",
        content: ` Generate emailon behalf of Rahul dharwal for the Client team to showcase how are the users feedback , this is for the client ."

Feedback data:
[
  { "title": "Bug Reports", "desc": "I found a vulnerability very dangerous — it can help in DDoS attack !!!!!!", "url": "localhost" },
  { "title": "Feature Requests", "desc": "ytjdjdjyj", "url": "localhost" },
  { "title": "Bug Reports", "desc": "The app feels too heavy and slow to load on lower-end devices.", "url": "localhost" },
  { "title": "General Feedback", "desc": "okish", "url": "localhost" },
  { "title": "Bug Reports", "desc": "Frontend buttons on the dashboard overlap when resizing the window.", "url": "localhost/dashboard" },
  { "title": "Feature Requests", "desc": "Can we have a dark mode toggle and persistent theme setting?", "url": "localhost/settings" },
  { "title": "Bug Reports", "desc": "Login API randomly returns 500 error when invalid tokens are sent.", "url": "localhost/api/login" },
  { "title": "Performance", "desc": "Database query for reports endpoint is taking over 12 seconds — needs optimization.", "url": "localhost/api/reports" },
  { "title": "Security", "desc": "Sensitive error stack traces are visible in production logs.", "url": "localhost/logs" },
  { "title": "UI/UX", "desc": "Charts are not responsive on mobile, especially in analytics view.", "url": "localhost/analytics" },
  { "title": "Security", "desc": "Password reset link does not expire after use.", "url": "localhost/auth/reset" },
  { "title": "Feature Requests", "desc": "Would be great if admins could export feedback data as CSV.", "url": "localhost/admin/feedback" },
  { "title": "Backend", "desc": "Worker queue gets stuck under heavy load — needs retry mechanism.", "url": "localhost/worker" },
  { "title": "Bug Reports", "desc": "File upload progress bar doesn’t show completion state.", "url": "localhost/upload" },
  { "title": "Security", "desc": "JWT tokens not invalidated after password change — potential session hijack risk.", "url": "localhost/auth" },
  { "title": "UI/UX", "desc": "Modal close button is barely visible in light mode.", "url": "localhost/ui/modal" },
  { "title": "Performance", "desc": "Image compression takes too long — optimize backend pipeline.", "url": "localhost/media" },
  { "title": "Feature Requests", "desc": "Add audit log view for admin actions.", "url": "localhost/admin/audit" },
  { "title": "General Feedback", "desc": "Great progress overall, but performance and security still need focus.", "url": "localhost" }
]

Email should be specially for the team or person mentioned , like for cyber only show realed to security things if not availabe just make email regarding not info for cyber related , if for client team generate summary for client how are the user responding and use current date and time.
Respond ONLY with valid JSON:
{
  "response": "Short conversational reply for the user.",
  "reports_or_emails": {
    "cyber(here the name should be exact at given in the prompt (if client Team then key shoudl be client ))": "Full ready-to-send email if relevant."
  }
}
No reasoning, no comments, no markdown.`,
      },
    ],
  });

  let result = "";
  for await (const chunk of completion) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) result += content;
  }

  // Remove accidental think traces if model emits them
  result = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  console.log("Clean Output:\n", result);
}

main().catch(console.error);
