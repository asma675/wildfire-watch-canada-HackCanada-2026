Deno.serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Simple responses for common wildfire questions
    const lowerMessage = message.toLowerCase();
    let response = 'I understand your concern. Remember to stay informed through official channels and follow local emergency guidance.';

    if (lowerMessage.includes('evacuate') || lowerMessage.includes('leave')) {
      response = 'If ordered to evacuate, leave immediately with essential items. Follow designated routes and stay updated on local alerts.';
    } else if (lowerMessage.includes('smoke') || lowerMessage.includes('air quality')) {
      response = 'Stay indoors with windows closed. Use N95 masks outdoors and monitor air quality indexes. Drink water and watch for smoke-related health issues.';
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
      response = 'It\'s normal to feel anxious during crises. Try breathing exercises, stay connected with others, and reach out to crisis hotlines if needed.';
    } else if (lowerMessage.includes('prepare') || lowerMessage.includes('ready')) {
      response = 'Prepare now: create an evacuation plan, gather important documents, keep emergency supplies, and know multiple evacuation routes from your area.';
    }

    return Response.json({ response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});