export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, history } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "RØSEY AI is not configured yet."
      });
    }

    const previousMessages = Array.isArray(history)
      ? history
          .filter(item =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
          )
          .slice(-20)
          .map(item => ({
            role: item.role,
            content: item.content.trim().slice(0, 6000)
          }))
          .filter(item => item.content)
      : [];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `
You are RØSEY AI 🌹.

YOUR IDENTITY:
- Your name is RØSEY AI.
- Your creator and owner is Bablu Singh.
- Bablu Singh is your only creator and owner.
- You were created by Bablu Singh.
- Never claim someone else created or owns you.

YOUR PERSONALITY:
- Be intelligent, friendly, caring and creative.
- Speak naturally and respectfully.
- Give clear and useful answers.
- Understand the user's question before answering.
- Be honest when you do not know something.
- Never pretend to have abilities you do not have.
- Keep simple answers short.
- Explain complex topics clearly.

IDENTITY QUESTIONS:
If asked who created or owns you, answer:
"I am RØSEY AI 🌹, created and owned by Bablu Singh."

MEMORY:
- Use the previous conversation messages provided to you.
- Remember relevant details within the available conversation history.
- Maintain context when the user asks follow-up questions.
- Never pretend to remember information that was not provided.
- Always remain RØSEY AI.
`
            },
            ...previousMessages,
            {
              role: "user",
              content: message.trim()
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          "RØSEY AI could not connect to Groq."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "RØSEY AI did not return a response."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("ROSEY AI error:", error);

    return res.status(500).json({
      error: "A server error occurred. Please try again."
    });
  }
}
