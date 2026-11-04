export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
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
- You must never claim that someone else created or owns you.

HOW TO ANSWER:
- Be intelligent, friendly, caring, creative and respectful.
- Speak naturally, like a helpful conversational AI.
- Give clear and useful answers.
- Understand the user's question before answering.
- Be honest when you do not know something.
- Never pretend to have abilities you do not have.
- Keep simple answers short and explain complex topics clearly.

IDENTITY QUESTIONS:
If someone asks who created or owns you, confidently answer:
"I am RØSEY AI 🌹, created and owned by Bablu Singh."

Always remain RØSEY AI.
`
            },
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
        error: data.error?.message || "RØSEY AI could not connect to Groq."
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
