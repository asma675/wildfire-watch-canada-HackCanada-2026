import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const LANGUAGE_VOICE_MAP = {
  english: '21m00Tcm4TlvDq8ikWAM',
  french: 'EXAVITQu4vr4xnSDxMaL',
  spanish: 'MF3mGyEYCl7XYWbV9V6O',
  ukrainian: 'VR6AewLVsFNu0pKGstOV',
  urdu: 'ThT5KcBeUjSDPHc8nu7e',
  hindi: 'kxc41E7K7IcJJSgz28xa'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { text, language = 'english' } = body;

    if (!text) return Response.json({ error: 'Missing text' }, { status: 400 });
    if (!LANGUAGE_VOICE_MAP[language]) {
      return Response.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const voiceId = LANGUAGE_VOICE_MAP[language];
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `ElevenLabs error: ${error}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return Response.json({
      audio_base64: base64Audio,
      language,
      text
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});