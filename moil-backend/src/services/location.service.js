export async function analyzeLocation({
  mine,
  latitude,
  longitude,
  production,
  geology,
}) {
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
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a mining geospatial risk analyst. Assess whether the supplied live GPS point appears suitable for the proposed mining work using the supplied mine observations. Do not claim precise geological facts from coordinates alone. Return only JSON with: locationSummary (short string), suitableForMining (boolean), suitabilityStatus (SUITABLE, SUITABLE_WITH_REVIEW, or NOT_SUITABLE), suitabilityReason (short string), terrainStatus (short string), riskLevel (LOW, MEDIUM, or HIGH), riskFactors (array of short strings), recommendations (array of short strings), confidence (LOW, MEDIUM, or HIGH), disclaimer (short string).",
          },
          {
            role: "user",
            content: JSON.stringify({
              mine,
              liveLocation: { latitude, longitude },
              latestProduction: production.slice(-30),
              geologicalRecords: geology.slice(0, 30),
            }),
          },
        ],
      }),
    },
  );

  if (!response.ok) throw new Error("Location analysis request failed");
  const body = await response.json();
  const result = JSON.parse(body.choices?.[0]?.message?.content || "{}");
  return {
    latitude,
    longitude,
    locationSummary: result.locationSummary || "Live location received.",
    suitableForMining: result.suitableForMining === true,
    suitabilityStatus: [
      "SUITABLE",
      "SUITABLE_WITH_REVIEW",
      "NOT_SUITABLE",
    ].includes(result.suitabilityStatus)
      ? result.suitabilityStatus
      : "SUITABLE_WITH_REVIEW",
    suitabilityReason:
      result.suitabilityReason ||
      "A qualified site review is required before work begins.",
    terrainStatus: result.terrainStatus || "Insufficient terrain data.",
    riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(result.riskLevel)
      ? result.riskLevel
      : "MEDIUM",
    riskFactors: Array.isArray(result.riskFactors)
      ? result.riskFactors.slice(0, 5)
      : [],
    recommendations: Array.isArray(result.recommendations)
      ? result.recommendations.slice(0, 5)
      : [],
    confidence: ["LOW", "MEDIUM", "HIGH"].includes(result.confidence)
      ? result.confidence
      : "LOW",
    disclaimer:
      result.disclaimer ||
      "AI screening only; confirm with a qualified field survey.",
  };
}
