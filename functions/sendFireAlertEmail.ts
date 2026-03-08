import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recipientEmail } = await req.json();

    if (!recipientEmail) {
      return Response.json({ error: 'recipientEmail required' }, { status: 400 });
    }

    // Get all active wildfire events in BC
    const events = await base44.asServiceRole.entities.WildfireEvent.filter({ 
      status: "active",
    });

    const bcFires = events.filter(e => {
      // BC is roughly between 49-60°N latitude and 114-139°W longitude
      return e.latitude && e.longitude && 
             e.latitude >= 48 && e.latitude <= 61 &&
             e.longitude >= -140 && e.longitude <= -114;
    });

    // Build email HTML
    let firesList = '';
    if (bcFires.length === 0) {
      firesList = '<p style="color: #22c55e; font-weight: bold;">✓ No active wildfires detected in BC at this time</p>';
    } else {
      firesList = '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
      firesList += '<tr style="background-color: #1a1a2e; border-bottom: 2px solid #f59e0b;"><th style="padding: 10px; text-align: left;">Fire</th><th style="padding: 10px; text-align: left;">Severity</th><th style="padding: 10px; text-align: left;">Status</th><th style="padding: 10px; text-align: left;">Detected</th></tr>';
      
      bcFires.forEach(fire => {
        const severityColor = fire.severity === 'evacuation' ? '#ef4444' : fire.severity === 'warning' ? '#f97316' : '#3b82f6';
        const detectedTime = new Date(fire.detected_at).toLocaleString();
        firesList += `<tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 10px;">${fire.title}</td>
          <td style="padding: 10px;"><span style="color: ${severityColor}; font-weight: bold; text-transform: uppercase;">${fire.severity}</span></td>
          <td style="padding: 10px;">${fire.status}</td>
          <td style="padding: 10px;">${detectedTime}</td>
        </tr>`;
      });
      firesList += '</table>';
    }

    const emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; background-color: #0f0f1a; color: #e2e8f0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a2e; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .content { color: #cbd5e1; line-height: 1.6; }
        h1 { color: #f59e0b; font-size: 28px; margin-bottom: 10px; }
        .alert-box { background-color: #374151; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔥 Wildfire Watch</div>
          <p style="color: #94a3b8; margin: 0;">Real-Time Fire Alert for BC</p>
        </div>

        <div class="content">
          <h1>Active Wildfire Alert</h1>
          
          <div class="alert-box">
            <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Region:</strong> British Columbia</strong></p>
            <p><strong>Active Fires:</strong> ${bcFires.length}</p>
          </div>

          ${firesList}

          <div class="alert-box" style="border-left-color: #ef4444; background-color: #7f1d1d;">
            <h3 style="margin-top: 0; color: #fca5a5;">⚠ Safety Reminder</h3>
            <p>If you are in an evacuation zone:</p>
            <ul style="margin: 10px 0;">
              <li>Evacuate immediately if ordered</li>
              <li>Follow official emergency guidance</li>
              <li>Monitor local news and alerts</li>
              <li>Never wait for evacuation orders in EXTREME situations</li>
            </ul>
          </div>

          <p style="margin-top: 20px;">
            For detailed information and to manage your alert preferences, visit your Wildfire Watch dashboard.
          </p>
        </div>

        <div class="footer">
          <p>Wildfire Watch © 2026 | Protecting Canadian Communities</p>
          <p>This is an automated alert. Email: asma.ahmed.work@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send via Gmail connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

    const emailMessage = `From: Wildfire Watch <noreply@wildfirewatch.ca>
To: ${recipientEmail}
Subject: Active Wildfire Alert - British Columbia (${bcFires.length} fires)
Content-Type: text/html; charset=utf-8

${emailBody}`;

    // Encode to base64url for Gmail API
    const encodedMessage = btoa(unescape(encodeURIComponent(emailMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (!gmailResponse.ok) {
      const err = await gmailResponse.text();
      return Response.json({ error: 'Failed to send email via Gmail', details: err }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: `Email sent to ${recipientEmail}`,
      fireCount: bcFires.length,
      fires: bcFires.map(f => ({ title: f.title, severity: f.severity }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});