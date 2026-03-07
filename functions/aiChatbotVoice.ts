Deno.serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Language detection - check keywords first, then character patterns
    const detectLanguage = (text) => {
      const hindiChars = /[\u0900-\u097F]/;
      const ukrainianChars = /[єіїґ]/i;
      const russianChars = /[абвгдежзийклмнопрстуфхцчшщъыьэюяё]/i;
      const frenchKeywords = /\bbonjour\b|\bmerci\b|s'il\s+vous\s+plaît|ça|être|vous|\bje\b|\bqu|où|ù|é|è|ê|ë|û|ç/i;
      const spanishKeywords = /¿|¡|\bhola\b|\bgracias\b|por\s+favor|evacuación|incendio|fuego|humo|\byo\b|\btu\b|qué|vamos|está/i;
      const englishKeywords = /\bhow\b|\bare\b|\byou\b|\bwhat\b|\bwhere\b|\bwhen\b|\bwhy\b|\bhelp\b|\beveryone\b|\bplease\b/i;

      // Check character patterns first (most specific)
      if (hindiChars.test(text)) return 'Hindi';
      if (ukrainianChars.test(text)) return 'Ukrainian';
      if (russianChars.test(text)) return 'Russian';
      
      // Then check keywords
      if (frenchKeywords.test(text)) return 'French';
      if (spanishKeywords.test(text)) return 'Spanish';
      if (englishKeywords.test(text)) return 'English';
      
      return 'English';
    };

    const detectedLanguage = detectLanguage(message);

    // Use Gemini to generate context-aware responses in the detected language
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + Deno.env.get('GEMINI_API_KEY'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful wildfire safety assistant for Canada. Answer the user's question about wildfires, fire prevention, evacuation, smoke exposure, emergency preparedness, or mental health during crises. 

User's question: "${message}"

Respond ONLY in ${detectedLanguage} language. Keep your response to 2-3 sentences max. Be specific and helpful, directly addressing their question. Focus on practical advice.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand your concern. Please follow official emergency guidance.';

      return Response.json({ response: aiResponse, language: detectedLanguage });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});