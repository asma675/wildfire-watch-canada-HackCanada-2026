import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stations = await base44.asServiceRole.entities.AirQuality.list();
    const updated = [];

    for (const station of stations) {
      try {
        const aqData = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Get current air quality data for the monitoring station near ${station.station_name}, ${station.province}, Canada at ${station.latitude}°N, ${station.longitude}°W. 
Return the current AQI value, PM2.5 concentration, and smoke level based on real current conditions.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              aqi: { type: "number" },
              pm25: { type: "number" },
              smoke_level: { type: "string", enum: ["None", "Light", "Moderate", "Heavy", "Hazardous"] },
            }
          }
        });

        await base44.asServiceRole.entities.AirQuality.update(station.id, {
          ...aqData,
          last_updated: new Date().toISOString(),
        });
        updated.push(station.station_name);
      } catch (e) {
        console.error(`Failed to update ${station.station_name}:`, e.message);
      }
    }

    return Response.json({ success: true, updated_count: updated.length, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});