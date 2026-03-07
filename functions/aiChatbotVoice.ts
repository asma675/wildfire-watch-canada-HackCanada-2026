Deno.serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Quick language detection by checking for common keywords
    const detectLanguage = (text) => {
      const hindiChars = /[\u0900-\u097F]/;
      const ukrainianChars = /[є і ї ґ]/i;
      const russianChars = /[а-яё]/i;
      const spanishKeywords = /¿|¡|hola|gracias|por favor/i;
      const frenchKeywords = /bonjour|merci|s'il vous plaît/i;

      if (hindiChars.test(text)) return 'Hindi';
      if (ukrainianChars.test(text)) return 'Ukrainian';
      if (russianChars.test(text)) return 'Russian';
      if (spanishKeywords.test(text)) return 'Spanish';
      if (frenchKeywords.test(text)) return 'French';
      return 'English';
    };

    const detectedLanguage = detectLanguage(message);

    // Use InvokeLLM for multi-language responses
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + Deno.env.get('GEMINI_API_KEY'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful wildfire safety assistant. A user has asked: "${message}"

Respond in ${detectedLanguage} language ONLY. Keep your response to 1-2 sentences max. Focus on wildfire safety, evacuation, smoke exposure, mental health support, or emergency preparedness as relevant.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand. Please follow official emergency guidance.';

    return Response.json({ response: aiResponse, language: detectedLanguage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});