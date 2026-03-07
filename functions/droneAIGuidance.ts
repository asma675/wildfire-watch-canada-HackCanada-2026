import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
    } else {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return Response.json({ error: err }, { status: 500 });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return Response.json({ guidance: text, mode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});