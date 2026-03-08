import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { phone_number } = body;

    if (!phone_number) {
      return Response.json({ error: 'phone_number required' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    const auth = btoa(`${accountSid}:${authToken}`);
    const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: phone_number,
        Body: '🔥 TEST ALERT: This is a test SMS from Wildfire Watch Canada. Your notifications are working correctly.'
      }).toString()
    });

    if (!smsRes.ok) {
      const error = await smsRes.text();
      return Response.json({ error: `Twilio error: ${error}` }, { status: 400 });
    }

    const result = await smsRes.json();
    return Response.json({ success: true, sid: result.sid, message: 'Test SMS sent successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});