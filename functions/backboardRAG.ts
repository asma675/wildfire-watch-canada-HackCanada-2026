import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BASE_URL = "https://app.backboard.io/api";
const API_KEY = Deno.env.get("BACKBOARD_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, assistant_id, thread_id, content, name, system_prompt } = body;

    if (action === "create_assistant") {
      const response = await fetch(`${BASE_URL}/assistants`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name || "Wildfire Knowledge Assistant",
          system_prompt: system_prompt || "You are an expert on Canadian wildfire safety, evacuation procedures, and environmental impact. Provide clear, accurate guidance based on official sources.",
          tok_k: 10
        })
      });
      const data = await response.json();
      return Response.json(data);
    }

    if (action === "create_thread") {
      const response = await fetch(`${BASE_URL}/assistants/${assistant_id}/threads`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      return Response.json(data);
    }

    if (action === "send_message") {
      const response = await fetch(`${BASE_URL}/threads/${thread_id}/messages`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: content,
          stream: false
        })
      });
      const data = await response.json();
      return Response.json(data);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});