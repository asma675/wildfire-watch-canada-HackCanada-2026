import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Fetch real weather from Open-Meteo (no API key needed)
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    temp_c: data.current?.temperature_2m ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    wind_kmh: data.current?.wind_speed_10m ?? null,
    precipitation_mm: data.current?.precipitation ?? null,
  };
}

// Fetch NDVI from NASA MODIS via FIRMS (vegetation dryness proxy via recent fire radiative power density)
// We use Open-Meteo's ERA5 soil moisture as a vegetation dryness proxy (free, no key)
async function fetchNDVI(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=et0_fao_evapotranspiration,soil_moisture_0_to_1cm_mean&timezone=auto&forecast_days=1`;
  const res = await fetch(url);
  const data = await res.json();
  const soilMoisture = data.daily?.soil_moisture_0_to_1cm_mean?.[0] ?? null;
  // Convert soil moisture (0-1 m³/m³) to a rough NDVI proxy (lower moisture = lower NDVI = drier)
  // Typical range 0.01 to 0.5; map to NDVI 0.1-0.9
  if (soilMoisture === null) return null;
  const ndvi = Math.min(0.9, Math.max(0.1, soilMoisture * 3.0));
  return Math.round(ndvi * 100) / 100;
}

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
        // Fetch real weather and NDVI in parallel
        const [weather, ndvi] = await Promise.all([
          fetchWeather(zone.latitude, zone.longitude),
          fetchNDVI(zone.latitude, zone.longitude),
        ]);

        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze wildfire risk for ${zone.name}, ${zone.province}, Canada at coordinates ${zone.latitude}°N, ${zone.longitude}°W.

REAL CURRENT CONDITIONS (live data):
- Temperature: ${weather.temp_c !== null ? weather.temp_c + '°C' : 'unknown'}
- Relative Humidity: ${weather.humidity !== null ? weather.humidity + '%' : 'unknown'}
- Wind Speed: ${weather.wind_kmh !== null ? weather.wind_kmh + ' km/h' : 'unknown'}
- Recent Precipitation: ${weather.precipitation_mm !== null ? weather.precipitation_mm + ' mm' : 'unknown'}
- NDVI (vegetation moisture index, 0=dry, 1=wet): ${ndvi !== null ? ndvi : 'unknown'}

Based on these REAL conditions plus your knowledge of historical fire activity and topography in this Canadian region, provide a precise wildfire risk assessment. Do not guess or simulate the weather values — use the real values above.`,
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

        // Override AI-returned weather with the real fetched values
        const finalUpdate = {
          ...analysis,
          weather_temp_c: weather.temp_c ?? analysis.weather_temp_c,
          weather_humidity: weather.humidity ?? analysis.weather_humidity,
          weather_wind_kmh: weather.wind_kmh ?? analysis.weather_wind_kmh,
          ndvi_score: ndvi ?? analysis.ndvi_score,
          last_analysis: new Date().toISOString(),
        };

        await base44.asServiceRole.entities.MonitoredZone.update(zone.id, finalUpdate);
        results.push({ zone: zone.name, success: true, threat_level: analysis.threat_level, weather, ndvi });
      } catch (e) {
        results.push({ zone: zone.name, success: false, error: e.message });
      }
    }

    return Response.json({ success: true, analyzed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});