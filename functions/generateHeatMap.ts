import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const zones = await base44.asServiceRole.entities.MonitoredZone.list();
    const airQuality = await base44.asServiceRole.entities.AirQuality.list();

    const heatMapData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on the following Canadian wildfire monitoring data, generate AI predictions for high-risk areas not currently being monitored.
      
Current monitored zones: ${zones.map(z => `${z.name} (${z.province}): ${z.threat_level}, score ${z.risk_score}`).join('; ')}
Air quality stations: ${airQuality.map(a => `${a.station_name}: AQI ${a.aqi}`).join('; ')}

Identify 3-5 additional areas in Canada that could be at elevated risk based on proximity to current threats, historical fire patterns, and typical weather patterns for this time of year.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_hotspots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                province: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                predicted_risk: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "EXTREME"] },
                risk_score: { type: "number" },
                reason: { type: "string" },
              }
            }
          },
          analysis_summary: { type: "string" },
        }
      }
    });

    return Response.json({ success: true, heatmap: heatMapData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});