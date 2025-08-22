const { Together } = require("together-ai");
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const askTogetherAI = async (req, res) => {
  try {
    console.log("📨 Full request body:", JSON.stringify(req.body, null, 2));
    
    // Extract messages first
    let messages =
      req.body?.variables?.data?.messages ||
      req.body?.variables?.data?.metaEvents?.[0]?.data?.messages ||
      [];

    if (!messages.length && req.body?.variables?.data?.metaEvents) {
      for (const event of req.body.variables.data.metaEvents) {
        if (event?.data?.messages) {
          messages = event.data.messages;
          break;
        }
      }
    }

    let prompt = "No message found";
    if (Array.isArray(messages) && messages.length) {
      const userMessages = messages.filter(
        (msg) =>
          msg.textMessage &&
          msg.textMessage.role === "user" &&
          msg.textMessage.content &&
          msg.textMessage.content.trim() !== ""
      );
      if (userMessages.length > 0) {
        prompt = userMessages[userMessages.length - 1].textMessage.content;
      }
    }

    console.log("📨 User prompt:", prompt);

    // Check if user is asking for actions
    const lowerPrompt = prompt.toLowerCase();
    
    // Handle clear charts request
    if (lowerPrompt.includes('clear') && (lowerPrompt.includes('chart') || lowerPrompt.includes('data'))) {
      console.log("🎯 Clear charts action requested");
      
      return res.status(200).json({
        data: {
          generateCopilotResponse: {
            messages: [
              {
                __typename: "ActionExecutionMessageOutput",
                id: "msg-" + Date.now(),
                createdAt: new Date().toISOString(),
                content: ["I'll clear all the charts for you!"],
                role: "assistant",
                parentMessageId: null,
                actionExecution: {
                  name: "clear-charts",
                  args: {},
                  status: "executing"
                }
              },
            ],
          },
        },
      });
    }
    
    // Handle remove website request
    if (lowerPrompt.includes('remove') && lowerPrompt.includes('website')) {
      console.log("🎯 Remove website action requested");
      
      // Extract website name (A, B, C, etc.)
      let websiteName = "Website A"; // default
      if (lowerPrompt.includes('website a') || lowerPrompt.includes('a')) {
        websiteName = "Website A";
      } else if (lowerPrompt.includes('website b') || lowerPrompt.includes('b')) {
        websiteName = "Website B";
      } else if (lowerPrompt.includes('website c') || lowerPrompt.includes('c')) {
        websiteName = "Website C";
      }
      
      return res.status(200).json({
        data: {
          generateCopilotResponse: {
            messages: [
              {
                __typename: "ActionExecutionMessageOutput",
                id: "msg-" + Date.now(),
                createdAt: new Date().toISOString(),
                content: [`I'll remove ${websiteName} from the chart!`],
                role: "assistant",
                parentMessageId: null,
                actionExecution: {
                  name: "remove-website",
                  args: {
                    websiteName: websiteName
                  },
                  status: "executing"
                }
              },
            ],
          },
        },
      });
    }

    // For data questions, provide actual data from your chart
    if (lowerPrompt.includes('feedback count') || lowerPrompt.includes('how many')) {
      let response = "Based on the current chart data:\n";
      response += "• Website A: 120 feedback counts\n";
      response += "• Website B: 80 feedback counts\n";
      response += "• Website C: 150 feedback counts";
      
      return res.status(200).json({
        data: {
          generateCopilotResponse: {
            messages: [
              {
                __typename: "TextMessageOutput",
                id: "msg-" + Date.now(),
                createdAt: new Date().toISOString(),
                content: [response],
                role: "assistant",
                parentMessageId: null,
              },
            ],
          },
        },
      });
    }
    
    // For rating questions
    if (lowerPrompt.includes('rating') || lowerPrompt.includes('2024-02')) {
      let response = "Based on the ratings data:\n";
      response += "• 2024-01: 3.0 rating\n";
      response += "• 2024-02: 4.0 rating\n";
      response += "• 2024-03: 4.5 rating\n";
      response += "• 2024-04: 4.8 rating";
      
      return res.status(200).json({
        data: {
          generateCopilotResponse: {
            messages: [
              {
                __typename: "TextMessageOutput",
                id: "msg-" + Date.now(),
                createdAt: new Date().toISOString(),
                content: [response],
                role: "assistant",
                parentMessageId: null,
              },
            ],
          },
        },
      });
    }

    // Default AI response for other questions
    const completion = await together.chat.completions.create({
      model: "meta-llama/Llama-3-8b-chat-hf",
      messages: [{ 
        role: "user", 
        content: `You are FeedSnap AI. Answer this question about feedback analytics: ${prompt}` 
      }],
    });

    const reply = completion.choices?.[0]?.message?.content || "I'm here to help with your feedback analytics!";

    return res.status(200).json({
      data: {
        generateCopilotResponse: {
          messages: [
            {
              __typename: "TextMessageOutput",
              id: "msg-" + Date.now(),
              createdAt: new Date().toISOString(),
              content: [reply],
              role: "assistant",
              parentMessageId: null,
            },
          ],
        },
      },
    });

  } catch (err) {
    console.error("❌ Copilot Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { askTogetherAI };