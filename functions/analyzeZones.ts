import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const zones = await base44.asServiceRole.entities.MonitoredZone.list();
    const activeZones = zones.filter(z => z.status !== 'inactive');
    const results = [];

    for (const zone of activeZones) {
      try {
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze wildfire risk for ${zone.name}, ${zone.province}, Canada at coordinates ${zone.latitude}°N, ${zone.longitude}°W. 
Consider current weather patterns, vegetation dryness (NDVI), historical fire data, and topography for this Canadian region. 
Return a risk assessment based on real current conditions.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              risk_score: { type: "number" },
              threat_level: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "EXTREME"] },
              weather_temp_c: { type: "number" },
              weather_humidity: { type: "number" },
              weather_wind_kmh: { type: "number" },
              ndvi_score: { type: "number" },
              analysis_summary: { type: "string" },
              recommendations: { type: "string" },
              historical_fire_context: { type: "string" },
            }
          }
        });

        await base44.asServiceRole.entities.MonitoredZone.update(zone.id, {
          ...analysis,
          last_analysis: new Date().toISOString(),
        });
        results.push({ zone: zone.name, success: true, threat_level: analysis.threat_level });
      } catch (e) {
        results.push({ zone: zone.name, success: false, error: e.message });
      }
    }

    return Response.json({ success: true, analyzed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});