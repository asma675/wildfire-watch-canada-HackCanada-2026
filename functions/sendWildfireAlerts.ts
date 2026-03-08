import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALERT_COOLDOWN_MINUTES = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { wildfire_event_id } = body;

    if (!wildfire_event_id) {
      return Response.json({ error: 'wildfire_event_id required' }, { status: 400 });
    }

    // 1. Load the wildfire event
    const event = await base44.asServiceRole.entities.WildfireEvent.get(wildfire_event_id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Find all users with saved locations within alert radius
    const allLocations = await base44.asServiceRole.entities.SavedLocation.list();
    const affectedEmails = new Set();
    const affectedUsers = {};

    allLocations.forEach(loc => {
      const distance = haversineDistance(
        event.latitude, event.longitude,
        loc.latitude, loc.longitude
      );
      if (distance <= (loc.alert_radius_km || 50)) {
        affectedEmails.add(loc.user_email);
        affectedUsers[loc.user_email] = loc;
      }
    });

    // 3. For each affected user, check preferences and send alerts
    const results = [];
    for (const userEmail of affectedEmails) {
      const prefs = await base44.asServiceRole.entities.NotificationPreferences.filter({
        user_email: userEmail
      });
      const prefObj = prefs[0];

      // Skip if user has no email enabled
      if (!prefObj || !prefObj.email_enabled) continue;

      // Check if severity is enabled
      const severityEnabled = prefObj[`${event.severity}_enabled`];
      if (!severityEnabled) continue;

      // Check for duplicate sends within cooldown
      const recentLogs = await base44.asServiceRole.entities.NotificationLog.filter({
        user_email: userEmail,
        wildfire_event_id: wildfire_event_id,
        channel: 'email'
      });
      const hasSentRecently = recentLogs.some(log => {
        const sentTime = new Date(log.sent_at || log.created_date);
        const cooldownMs = ALERT_COOLDOWN_MINUTES * 60 * 1000;
        return (Date.now() - sentTime.getTime()) < cooldownMs && log.severity_at_send === event.severity;
      });

      if (hasSentRecently) {
        results.push({ email: userEmail, status: 'skipped_duplicate' });
        continue;
      }

      // Create NotificationLog record
      const logRes = await base44.asServiceRole.entities.NotificationLog.create({
        user_email: userEmail,
        wildfire_event_id: wildfire_event_id,
        channel: 'email',
        status: 'queued',
        severity_at_send: event.severity
      });

      // 4. Send email via Core integration
      const emailBody = buildEmailBody(event, userEmail);
      const emailRes = await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: buildEmailSubject(event),
        body: emailBody,
        from_name: 'Wildfire Watch Canada'
      });

      // Update log status
      await base44.asServiceRole.entities.NotificationLog.update(logRes.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_id: 'core_email'
      });

      results.push({ email: userEmail, status: 'sent' });
    }

    return Response.json({
      event_id: wildfire_event_id,
      affected_users: affectedEmails.size,
      sent: results.filter(r => r.status === 'sent').length,
      results: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function buildEmailSubject(event) {
  const severity = event.severity.toUpperCase();
  return `🔥 ${severity} - Wildfire Alert: ${event.title}`;
}

function buildEmailBody(event, userEmail) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff6b35 0%, #d61f3b 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">WILDFIRE ALERT</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;">${event.severity}</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #333; margin-top: 0;">Fire: ${event.title}</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Location:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</p>
          <p style="margin: 5px 0;"><strong>Severity:</strong> <span style="text-transform: capitalize; font-weight: bold; color: ${getSeverityColor(event.severity)}">${event.severity}</span></p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${event.status}</p>
          <p style="margin: 5px 0;"><strong>Detected:</strong> ${new Date(event.detected_at).toLocaleString()}</p>
        </div>

        ${event.health_risk_text ? `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #856404;">Health Risks</h3>
          <p style="margin: 0; color: #856404;">${event.health_risk_text}</p>
        </div>
        ` : ''}

        ${event.guidance_text ? `
        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0c5460;">Guidance</h3>
          <p style="margin: 0; color: #0c5460;">${event.guidance_text}</p>
        </div>
        ` : ''}

        ${event.evacuation_text ? `
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #721c24;">Evacuation Instructions</h3>
          <p style="margin: 0; color: #721c24;">${event.evacuation_text}</p>
        </div>
        ` : ''}

        <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          This is an automated alert from Wildfire Watch Canada. Open the app for real-time updates.
        </p>
      </div>
    </div>
  `;
  return html;
}

function getSeverityColor(severity) {
  const colors = { advisory: '#FFA500', warning: '#FF6B00', evacuation: '#DC3545' };
  return colors[severity] || '#666';
}