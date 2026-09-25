export async function askMineAssistant({ mine, question, dashboard }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "You are MOIL AI, a precise mining intelligence assistant. Answer the user's single question about the selected mine using only the supplied dashboard context. Give one meaningful, self-contained paragraph. Use no markdown, headings, bullets, or multiple sections. Keep it concise, ideally 40-80 words and never over 100 words. Explain uncertainty when data is missing, never invent measurements, and include one practical next step when useful. If the question cannot be answered from the dashboard, say that clearly and state what data is needed.",
          },
          {
            role: "user",
            content: JSON.stringify({ mine, question, dashboard }),
          },
        ],
      }),
    },
  );

  if (!response.ok) throw new Error("AI assistant request failed");
  const body = await response.json();
  const answer = body.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("AI assistant returned no answer");
  return answer
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/gm, "")
    .replace(/[#*_]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
