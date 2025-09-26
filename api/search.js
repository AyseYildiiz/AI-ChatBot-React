export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    // Check if API keys exist
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: "Google API key not configured" });
    }

    if (!process.env.GOOGLE_SEARCH_ENGINE_ID) {
      return res
        .status(500)
        .json({ error: "Google Search Engine ID not configured" });
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${
      process.env.GOOGLE_API_KEY
    }&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(q)}`;

    console.log("Making Google API request...");

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Google API Error:", response.status, errorData);

      if (response.status === 403) {
        return res.status(403).json({
          error:
            "Google API access forbidden. Check your API key and search engine ID.",
        });
      } else if (response.status === 429) {
        return res.status(429).json({
          error: "Google API quota exceeded",
        });
      } else {
        return res.status(response.status).json({
          error: `Google API error: ${response.statusText}`,
        });
      }
    }

    const data = await response.json();

    // Check if the response has error
    if (data.error) {
      console.error("Google API returned error:", data.error);
      return res.status(400).json({
        error: "Google API error",
        details: data.error.message,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Search API Error:", err);
    res.status(500).json({
      error: "Google API error",
      details: err.message,
    });
  }
}
