export default async function handler(req, res) {
  try {
    const { q } = req.query;

    const url = `https://www.googleapis.com/customsearch/v1?key=${
      process.env.GOOGLE_API_KEY
    }&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(q)}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Google API hatası", details: err.message });
  }
}
