import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Invoke LLM with wildfire + mental health context
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate AI assistant helping people during wildfire crises and their mental health impacts.

User message: "${message}"

Provide clear, empathetic, and actionable advice about:
- Wildfire safety and evacuation procedures
- Health risks from smoke and air quality
- Mental health support and stress management
- Resources and emergency contacts

Keep responses concise and conversational (2-3 sentences max). Be warm and supportive.`,
      add_context_from_internet: true,
    });

    return Response.json({ response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});