function compactDashboard(dashboard = {}) {
  dashboard ??= {};
  const pick = (record, fields) =>
    Object.fromEntries(
      fields
        .filter((field) => record?.[field] !== undefined)
        .map((field) => [field, record[field]]),
    );
  const predictionFields = [
    "predictionDate",
    "shortfallRisk",
    "predictedReserveTons",
    "predictedProductionTons",
    "shortfallTons",
    "riskFactors",
    "recommendations",
  ];
  const productionFields = [
    "date",
    "plannedTons",
    "actualTons",
    "equipmentHours",
    "downtimeHours",
    "rainfallMm",
    "soilMoisture",
    "vegetationIndex",
    "landTemperature",
  ];
  const geologyFields = [
    "drillingDate",
    "depth",
    "manganeseGrade",
    "oreThickness",
    "density",
    "lithology",
    "source",
  ];

  return {
    latestPrediction: pick(dashboard.latestPrediction, predictionFields),
    productionTrend: (dashboard.productionTrend || [])
      .slice(-12)
      .map((row) => pick(row, productionFields)),
    geologicalData: (dashboard.geologicalData || [])
      .slice(0, 8)
      .map((row) => pick(row, geologyFields)),
    environmentPrediction: pick(dashboard.environmentPrediction, [
      "rainfallMm",
      "soilMoisture",
      "landTemperature",
      "vegetationIndex",
      "source",
    ]),
  };
}

export async function askMineAssistant({ mine, question, history, dashboard }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  const conversation = Array.isArray(history)
    ? history
        .filter(
          (message) =>
            ["user", "assistant"].includes(message?.role) &&
            typeof message.content === "string",
        )
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content.slice(0, 1000),
        }))
    : [];

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
              "You are MOIL AI, a precise mining intelligence assistant. Answer the user's question about the selected mine using only the supplied dashboard data and conversation history. Give one meaningful, self-contained paragraph. Use no markdown, headings, bullets, or multiple sections. Keep it concise, ideally 40-80 words and never over 100 words. Explain uncertainty when data is missing, never invent measurements, and include one practical next step when useful. If the question cannot be answered from the supplied information, say that clearly and state what data is needed.",
          },
          ...conversation,
          {
            role: "user",
            content: JSON.stringify({
              mine,
              question,
              dashboard: compactDashboard(dashboard),
            }),
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
