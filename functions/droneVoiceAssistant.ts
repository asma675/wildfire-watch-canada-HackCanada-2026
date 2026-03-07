import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spokenText, droneId, personLocation } = await req.json();

    if (!spokenText) {
      return Response.json({ error: 'Spoken text required' }, { status: 400 });
    }

    // Detect language from spoken text
    const langDetection = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect the language of this text in one word only (e.g., "English", "French", "Spanish"):
"${spokenText}"`,
    });

    const detectedLanguage = langDetection.trim();

    // Generate drone guidance in detected language
    const guidance = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a rescue drone assistant speaking to a person in danger from wildfire.
The person is speaking ${detectedLanguage}.

Person said: "${spokenText}"

Respond ONLY in ${detectedLanguage} with:
1. Acknowledgment and reassurance
2. Clear evacuation directions based on their location
3. Safety tips while they move

Keep it SHORT (2-3 sentences max). Be urgent but calm.`,
      add_context_from_internet: true,
    });

    // Get ElevenLabs voice for language
    const voiceMap = {
      'English': 'en',
      'French': 'fr',
      'Spanish': 'es',
      'German': 'de',
      'Mandarin': 'zh',
      'Arabic': 'ar',
    };

    const languageCode = voiceMap[detectedLanguage] || 'en';

    return Response.json({
      guidance,
      detectedLanguage,
      languageCode,
      droneId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});