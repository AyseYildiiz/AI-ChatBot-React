export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  const responseMessage = "Bu bir test yanıtıdır.";

  res.status(200).json({
    choices: [{ message: { content: responseMessage } }],
  });
}
