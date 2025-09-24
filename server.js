import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI API hatası", details: err.message });
  }
});

app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${
      process.env.GOOGLE_API_KEY
    }&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(q)}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Google API hatası", details: err.message });
  }
});

app.listen(5174, () => console.log("Server running on http://localhost:5174"));
