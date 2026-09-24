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
        messages: [
          {
            role: "system",
            content:
              "You are MOIL AI, a concise mining intelligence assistant. Answer questions about the selected mine using only the supplied dashboard context. Explain uncertainty, do not invent measurements, and give practical next steps. Keep answers under 120 words.",
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
  return answer;
}
