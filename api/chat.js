import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.2,
    });

    const chatResponse = response.choices[0].message.content.trim();

    res.status(200).json({
      choices: [{ message: { content: chatResponse } }],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API hatası", details: err.message });
  }
}
