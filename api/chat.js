import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { model, messages, max_tokens, temperature } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const response = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages,
      max_tokens: max_tokens || 500,
      temperature: temperature || 0.2,
    });

    // Match the expected response format from your frontend
    res.status(200).json({
      choices: [
        {
          message: {
            content: response.choices[0].message.content,
          },
        },
      ],
    });
  } catch (err) {
    console.error("OpenAI API Error:", err);

    // Handle different types of errors
    if (err.status === 401) {
      res.status(401).json({ error: "Invalid OpenAI API key" });
    } else if (err.status === 429) {
      res.status(429).json({ error: "Rate limit exceeded" });
    } else {
      res.status(500).json({
        error: "OpenAI API error",
        details: err.message,
      });
    }
  }
}
