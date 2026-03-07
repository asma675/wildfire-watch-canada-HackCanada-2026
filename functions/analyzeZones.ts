import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await base44.entities.MonitoredZone.filter({ status: 'active' });
    const results = [];

    for (const zone of zones) {
      try {
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a wildfire risk analyst for Canada. Analyze this zone for current wildfire risk:
Zone: ${zone.name}, Province: ${zone.province}
Coordinates: ${zone.latitude}°N, ${zone.longitude}°W
Current data if available: Temp ${zone.weather_temp_c || 'unknown'}°C, Humidity ${zone.weather_humidity || 'unknown'}%, Wind ${zone.weather_wind_kmh || 'unknown'} km/h

Use real current weather and fire conditions for this Canadian location. Consider:
- Current temperature, humidity, wind
- Vegetation dryness (NDVI)
- Historical fire activity in this region
- Current fire danger ratings
- Terrain and fuel load

Be accurate and provide real data.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              risk_score: { type: "number", description: "0-100 risk score" },
              threat_level: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "EXTREME"] },
              weather_temp_c: { type: "number" },
              weather_humidity: { type: "number" },
              weather_wind_kmh: { type: "number" },
              ndvi_score: { type: "number", description: "0-1" },
              analysis_summary: { type: "string", description: "2-3 sentence summary" },
              recommendations: { type: "string", description: "Key recommendations" },
              historical_fire_context: { type: "string", description: "Brief historical context" },
            },
          },
        });

        await base44.asServiceRole.entities.MonitoredZone.update(zone.id, {
          ...analysis,
          last_analysis: new Date().toISOString(),
        });

        results.push({ zone: zone.name, status: 'analyzed', risk_score: analysis.risk_score });
      } catch (err) {
        results.push({ zone: zone.name, status: 'error', error: err.message });
      }
    }

    return Response.json({ success: true, analyzed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});