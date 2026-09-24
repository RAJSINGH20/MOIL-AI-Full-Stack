function fallbackEnvironment(rows) {
  const latest = rows[rows.length - 1] || {};
  return {
    rainfallMm: latest.rainfallMm ?? null,
    soilMoisture: latest.soilMoisture ?? null,
    landTemperature: latest.landTemperature ?? null,
    vegetationIndex: latest.vegetationIndex ?? null,
    source: rows.length
      ? "Latest mine observation"
      : "No observation available",
  };
}

export async function predictEnvironment(mine, rows) {
  const fallback = fallbackEnvironment(rows);
  const key = process.env.GROQ_API_KEY;
  if (!key || !rows.length) return fallback;

  try {
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
                "You predict mining environmental conditions. Return only JSON with numeric rainfallMm, soilMoisture, landTemperature, vegetationIndex, and a short source string. Preserve realistic units and ranges.",
            },
            {
              role: "user",
              content: JSON.stringify({
                mine,
                latestObservations: rows.slice(-30),
              }),
            },
          ],
        }),
      },
    );
    if (!response.ok) return fallback;
    const body = await response.json();
    const prediction = JSON.parse(body.choices?.[0]?.message?.content || "{}");
    return {
      rainfallMm: Number.isFinite(Number(prediction.rainfallMm))
        ? Number(prediction.rainfallMm)
        : fallback.rainfallMm,
      soilMoisture: Number.isFinite(Number(prediction.soilMoisture))
        ? Number(prediction.soilMoisture)
        : fallback.soilMoisture,
      landTemperature: Number.isFinite(Number(prediction.landTemperature))
        ? Number(prediction.landTemperature)
        : fallback.landTemperature,
      vegetationIndex: Number.isFinite(Number(prediction.vegetationIndex))
        ? Number(prediction.vegetationIndex)
        : fallback.vegetationIndex,
      source: "Groq AI prediction",
    };
  } catch {
    return fallback;
  }
}
