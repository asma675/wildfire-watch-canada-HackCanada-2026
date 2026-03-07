import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use AI with internet context to find current fire risk conditions across Canada
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a Canadian wildfire prediction system. Using current satellite data, weather conditions, drought indices, and historical fire patterns, identify the TOP 8 regions in Canada most at risk of wildfires starting in the NEXT 7-14 days (predicted fires, NOT currently active fires).

For each predicted risk zone, provide:
1. Region name and province
2. Latitude/longitude (center of risk area)
3. Risk level: "CRITICAL", "HIGH", or "MODERATE"
4. Risk score 0-100
5. A concise but detailed explanation (2-3 sentences) covering WHY this area is at risk
6. Primary risk factors as an array of short tags (e.g. "Low humidity", "High winds", "Drought", "Dry fuels")
7. Weather forecast data for the region:
   - temp_c: forecasted max temperature in Celsius (number)
   - precip_mm: forecasted precipitation in mm over next 7 days (number)
   - wind_kmh: forecasted max wind speed in km/h (number)
   - humidity_pct: forecasted average relative humidity percentage (number)
   - weather_summary: one short sentence describing the forecast (string)
   - temp_anomaly: temperature deviation from seasonal norm in °C, positive=warmer (number)

Focus on regions with dry conditions, drought stress, upcoming heat/wind events, or historically fire-prone boreal/grassland areas. Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON, no markdown.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region: { type: "string" },
                province: { type: "string" },
                lat: { type: "number" },
                lon: { type: "number" },
                risk_level: { type: "string" },
                risk_score: { type: "number" },
                explanation: { type: "string" },
                risk_factors: { type: "array", items: { type: "string" } },
                temp_c: { type: "number" },
                precip_mm: { type: "number" },
                wind_kmh: { type: "number" },
                humidity_pct: { type: "number" },
                weather_summary: { type: "string" },
                temp_anomaly: { type: "number" }
              }
            }
          },
          generated_at: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      predictions: result.predictions || [],
      generated_at: result.generated_at || new Date().toISOString(),
      summary: result.summary || ""
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});