import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stations = await base44.entities.AirQuality.filter({});
    const results = [];

    for (const station of stations) {
      try {
        const data = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Provide current air quality data for this Canadian location:
Station: ${station.station_name}
Location: ${station.latitude}°N, ${station.longitude}°W

Return realistic current air quality data. Consider any active wildfires or smoke conditions.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              aqi: { type: "number", description: "AQI value 0-500" },
              pm25: { type: "number", description: "PM2.5 concentration" },
              smoke_level: { type: "string", enum: ["None", "Light", "Moderate", "Heavy", "Hazardous"] },
            },
          },
        });

        await base44.asServiceRole.entities.AirQuality.update(station.id, {
          ...data,
          last_updated: new Date().toISOString(),
        });

        results.push({ station: station.station_name, status: 'updated', aqi: data.aqi });
      } catch (err) {
        results.push({ station: station.station_name, status: 'error', error: err.message });
      }
    }

    return Response.json({ success: true, updated: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});