export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;

  res.status(200).json({
    items: [
      {
        title: "Test Sonuç 1",
        snippet: "Snippet 1",
        link: "https://example.com",
      },
    ],
  });
}
