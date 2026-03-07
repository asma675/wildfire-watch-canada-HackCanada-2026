import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const prompt = `You are a Canadian wildfire prediction system with access to current satellite data, weather conditions, drought indices, and historical fire patterns. Identify the TOP 8 regions in Canada most at risk of wildfires starting in the NEXT 7-14 days (predicted fires, NOT currently active fires).

For each predicted risk zone provide:
1. Region name and province
2. Latitude/longitude (center of risk area)
3. Risk level: "CRITICAL", "HIGH", or "MODERATE"
4. Risk score 0-100
5. A concise but detailed explanation (2-3 sentences) covering WHY this area is at risk
6. Primary risk factors as an array of short tags (e.g. "Low humidity", "High winds", "Drought", "Dry fuels")
7. Weather forecast data:
   - temp_c: forecasted max temperature in Celsius (number)
   - precip_mm: forecasted precipitation in mm over next 7 days (number)
   - wind_kmh: forecasted max wind speed in km/h (number)
   - humidity_pct: forecasted average relative humidity percentage (number)
   - weather_summary: one short sentence describing the forecast (string)
   - temp_anomaly: temperature deviation from seasonal norm in °C, positive=warmer (number)

Focus on regions with dry conditions, drought stress, upcoming heat/wind events, or historically fire-prone boreal/grassland areas. Today's date is ${new Date().toISOString().split('T')[0]}.

Respond ONLY with valid JSON matching this exact structure:
{
  "predictions": [
    {
      "region": "string",
      "province": "string",
      "lat": number,
      "lon": number,
      "risk_level": "CRITICAL|HIGH|MODERATE",
      "risk_score": number,
      "explanation": "string",
      "risk_factors": ["string"],
      "temp_c": number,
      "precip_mm": number,
      "wind_kmh": number,
      "humidity_pct": number,
      "weather_summary": "string",
      "temp_anomaly": number
    }
  ],
  "generated_at": "ISO date string",
  "summary": "string"
}`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        },
        tools: [{ googleSearch: {} }]
      })
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      throw new Error(geminiData.error?.message || "Gemini API error");
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText);

    return Response.json({
      predictions: result.predictions || [],
      generated_at: result.generated_at || new Date().toISOString(),
      summary: result.summary || ""
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});