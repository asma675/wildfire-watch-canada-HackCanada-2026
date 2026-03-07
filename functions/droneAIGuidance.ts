import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode, drone, wearable, zone } = body;

    let prompt = "";

    if (mode === "rescue_guidance") {
      prompt = `You are an AI system guiding an autonomous wildfire rescue drone named "${drone?.name || 'WW-Drone'}".

Person status: ${wearable?.consciousness_status || 'unknown'}
Alert type: ${wearable?.alert_type || 'none'}
Heart rate: ${wearable?.heart_rate || 'N/A'} BPM
SpO2: ${wearable?.spo2 || 'N/A'}%
CO exposure: ${wearable?.co_exposure_ppm || 0} PPM
Body temp: ${wearable?.body_temp_c || 'N/A'}°C
Location: ${wearable?.latitude || 'unknown'}, ${wearable?.longitude || 'unknown'}
Drone equipped with: ${drone?.equipped_with || 'first aid kit, oxygen mask, AED, emergency blanket, water'}

Generate a calm, empathetic, step-by-step rescue guidance plan. Include:
1. Immediate actions for the drone to take
2. Voice script the drone should use to communicate with/comfort the person (even if unconscious)
3. First aid steps based on vital signs
4. Evacuation route advice
5. CPR/AED guidance if cardiac event
6. Emotional support phrases

Keep the tone warm, calm, professional, and reassuring. Format clearly with sections.`;
    } else if (mode === "fire_scan") {
      prompt = `You are an AI wildfire reconnaissance drone analyzing satellite hotspot data for zone "${zone?.name || 'Unknown Zone'}" in ${zone?.province || 'Canada'}.

Current risk score: ${zone?.risk_score || 'N/A'}/100
Threat level: ${zone?.threat_level || 'UNKNOWN'}
Temperature: ${zone?.weather_temp_c || 'N/A'}°C
Humidity: ${zone?.weather_humidity || 'N/A'}%
Wind: ${zone?.weather_wind_kmh || 'N/A'} km/h
NDVI: ${zone?.ndvi_score || 'N/A'}
Historical context: ${zone?.historical_fire_context || 'None'}

Based on this data, provide a drone scan mission briefing:
1. Priority scan sectors (cardinal directions, terrain features to focus on)
2. Estimated fire spread direction and speed
3. Risk hotspots to investigate
4. Recommended drone altitude and flight pattern
5. Safety assessment for the drone itself
6. What to report back to command

Be concise and tactical.`;
    } else if (mode === "thermal_scan") {
       prompt = `You are an AI thermal imaging system onboard wildfire rescue drone "${drone?.name || 'WW-Drone'}" equipped with a high-resolution infrared/thermal camera capable of detecting heat signatures through walls, smoke, and debris.

    The drone is currently operating inside or around a structure in a wildfire scenario.
    Drone location: ${drone?.latitude || 'unknown'}, ${drone?.longitude || 'unknown'}
    Altitude: ${drone?.altitude_m || 'low'} meters
    Zone: ${drone?.zone_name || 'unknown'}
    Equipped with: ${drone?.equipped_with || 'thermal camera, infrared sensors, gas detector'}

    Generate a realistic thermal imaging scan report as if the drone just completed a 360° infrared sweep of the surrounding structure. Include:

    1. **Thermal Map Summary** — describe heat signature readings through walls (e.g. "North wall: 340°C hotspot detected 4m behind drywall", "East corridor: 2 human heat signatures at floor level")
    2. **Fire Detection** — location, estimated intensity, spread direction, any gas pockets or flashover risk
    3. **Human Survivors Detected** — number, location relative to drone, estimated condition (conscious/unconscious based on movement signatures)
    4. **Structural Integrity** — which walls/floors are compromised based on heat absorption patterns
    5. **Recommended Entry/Rescue Routes** — safest path for human responders based on thermal data
    6. **Immediate Drone Actions** — what the drone should do right now (drop oxygen, signal location, etc.)

    Use realistic thermal imaging terminology. Be specific with directions (North/South/East/West), distances, and temperatures. Format with clear sections.`;
    } else if (mode === "evacuation_guidance") {
      prompt = `You are an AI evacuation system on a wildfire rescue drone named "${drone?.name || 'WW-Drone'}" guiding people to safety.

    Fire zone: ${zone?.name || 'Unknown Zone'}, ${zone?.province || 'Canada'}
    People location: ${wearable?.latitude || drone?.latitude || 'unknown'}, ${wearable?.longitude || drone?.longitude || 'unknown'}
    Threat level: ${zone?.threat_level || 'UNKNOWN'}
    Wind direction: ${zone?.weather_wind_kmh || 'N/A'} km/h

    Generate a CLEAR, CONCISE evacuation guide with:
    1. **Primary Escape Route** — step-by-step directions (North, South, East, West from current location)
    2. **Alternate Route** — if primary is blocked
    3. **Hazards to Avoid** — fire spread direction, toxic gas areas, structural dangers
    4. **Landmarks to Follow** — road signs, terrain features, structures to help navigation
    5. **Safe Zones** — nearest shelter/safe area with distance
    6. **Emergency Actions** — if trapped, what to do (find water, shelter, signal location)

    Make it simple, actionable, and reassuring. Use cardinal directions only (North/South/East/West/Up/Down).`;
    } else {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({ prompt });

    return Response.json({ guidance: result, mode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});