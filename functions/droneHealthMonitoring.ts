import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cameraImageUrl, droneId, personLocation } = await req.json();

    if (!cameraImageUrl) {
      return Response.json({ error: 'Camera image URL required' }, { status: 400 });
    }

    // Analyze person's health status from drone camera using Persage API
    const persageApiKey = Deno.env.get('PERSAGE_API_KEY');

    try {
      const persageResponse = await fetch('https://api.persage.io/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${persageApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: cameraImageUrl,
          analyze_health: true,
          detect_person: true,
        }),
      });

      if (!persageResponse.ok) {
        throw new Error(`Persage API error: ${persageResponse.statusText}`);
      }

      const persageData = await persageResponse.json();

      // Analyze results with Gemini for rescue context
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Health monitoring data from drone analyzing rescue situation:
        
Person detected: ${persageData.person_detected ? 'Yes' : 'No'}
Health indicators: ${persageData.health_indicators ? JSON.stringify(persageData.health_indicators) : 'None detected'}
Distress signs: ${persageData.distress_detected ? 'Yes' : 'No'}
Recommended action: Immediate rescue

Based on this data, provide:
1. Health concern summary
2. Immediate drone assistance recommendations
3. Emergency protocol escalation needs

Keep it brief and actionable.`,
      });

      // Store health assessment in database
      await base44.asServiceRole.entities.Drone.update(droneId, {
        mission_notes: `Health Assessment: ${analysis}\nPersage Detection: ${persageData.person_detected}`,
        person_status: persageData.distress_detected ? 'injured' : 'conscious',
      });

      return Response.json({
        analysis,
        persageData,
        drone_status: 'health_assessed_dispatch_ready',
      });
    } catch (persageError) {
      // Fallback: Use Gemini vision to analyze drone camera image
      const visionAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this drone camera image for human presence and health status:

Identify:
1. Is there a person visible?
2. Are they conscious and able to move?
3. Any visible signs of injury or distress?
4. Recommended rescue approach?

Be concise and urgent.`,
        file_urls: [cameraImageUrl],
      });

      return Response.json({
        analysis: visionAnalysis,
        using_fallback: true,
        message: 'Using drone camera analysis (Persage unavailable)',
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});