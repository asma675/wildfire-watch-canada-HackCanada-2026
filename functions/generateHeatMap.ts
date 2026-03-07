import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await base44.entities.MonitoredZone.filter({ status: 'active' });

    const heatMapData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on current Canadian wildfire conditions, analyze these monitored zones and identify additional predicted risk hotspots:

Monitored zones:
${zones.map(z => `- ${z.name} (${z.province}): Risk ${z.risk_score}/100, ${z.threat_level}`).join('\n')}

Identify 5-8 additional locations across Canada that are currently at elevated wildfire risk based on current conditions (weather, drought, fire activity). For each provide coordinates and predicted risk.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          hotspots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                predicted_risk: { type: "number" },
                reason: { type: "string" },
              },
            },
          },
          summary: { type: "string" },
        },
      },
    });

    return Response.json({
      success: true,
      hotspots: heatMapData.hotspots,
      summary: heatMapData.summary,
      zone_count: zones.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});