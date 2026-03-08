import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const emailTemplates = {
  advisory: (title, distance, lat, lng, guidance, health) => ({
    subject: `⚠️ Wildfire Advisory Near Your Location`,
    body: `
Wildfire Activity Detected

A wildfire has been detected approximately ${distance}km from your saved location.

Fire Details:
- Name: ${title}
- Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}
- Severity: ADVISORY

${health ? `Health Concerns:\n${health}\n` : ''}
${guidance ? `Safety Instructions:\n${guidance}\n` : ''}

Prepare Now:
- Have evacuation plan ready
- Keep phone charged
- Monitor official channels

View full details in the Wildfire Watch app.
    `.trim()
  }),
  warning: (title, distance, lat, lng, guidance, health) => ({
    subject: `🔥 Active Wildfire Warning - Prepare to Evacuate`,
    body: `
ACTIVE WILDFIRE WARNING

An active fire threat has been detected near your location.

Fire Details:
- Name: ${title}
- Distance: ~${distance}km away
- Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}
- Severity: WARNING

${health ? `Health Concerns:\n${health}\n` : ''}

PREPARE TO EVACUATE:
- Pack essentials now
- Prepare vehicle for rapid departure
- Limit outdoor exposure
- Keep mask/respirator available

${guidance ? `Additional Instructions:\n${guidance}\n` : ''}

Check Wildfire Watch app for evacuation centers and updates.
    `.trim()
  }),
  evacuation: (title, distance, lat, lng, guidance, health) => ({
    subject: `🚨 EVACUATION ORDER - Leave Immediately`,
    body: `
EVACUATION ORDER - LEAVE NOW

Fire danger is immediate in your area. Evacuate without delay.

Fire Details:
- Name: ${title}
- Distance: ~${distance}km away
- Severity: EVACUATION

${guidance || 'Follow official evacuation routes and instructions.'}

${health ? `Health Hazards:\n${health}\n` : ''}

EVACUATION STEPS:
1. Leave immediately if in evacuation zone
2. Follow designated evacuation routes
3. Take essential documents and medications
4. Report to evacuation center

For emergency: Call 911
Wildfire Watch app has evacuation centers and real-time updates.
    `.trim()
  })
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { wildfire_event_id } = body;

    if (!wildfire_event_id) {
      return Response.json({ error: 'wildfire_event_id required' }, { status: 400 });
    }

    // Load wildfire event
    const events = await base44.asServiceRole.entities.WildfireEvent.filter({ id: wildfire_event_id });
    if (!events.length) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = events[0];

    // Find all users with saved locations within alert radius
    const allLocations = await base44.asServiceRole.entities.SavedLocation.list();
    const affectedEmails = new Set();
    const userLocationMap = {};

    allLocations.forEach(loc => {
      const distance = haversineDistance(loc.latitude, loc.longitude, event.latitude, event.longitude);
      if (distance <= loc.alert_radius_km) {
        affectedEmails.add(loc.user_email);
        if (!userLocationMap[loc.user_email]) {
          userLocationMap[loc.user_email] = [];
        }
        userLocationMap[loc.user_email].push(loc);
      }
    });

    // Process each affected user
    const results = [];
    for (const email of affectedEmails) {
      // Get notification preferences
      const prefs = await base44.asServiceRole.entities.NotificationPreferences.filter({ user_email: email });
      const pref = prefs[0] || {};

      // Check if we should send this alert
      const shouldSendEmail = pref.email_enabled && (
        (event.severity === 'advisory' && pref.advisory_enabled) ||
        (event.severity === 'warning' && pref.warning_enabled) ||
        (event.severity === 'evacuation' && pref.evacuation_enabled)
      );

      if (!shouldSendEmail) {
        results.push({ email, status: 'skipped', reason: 'preferences disabled' });
        continue;
      }

      // Check for duplicate sends within 30 minutes (unless severity escalated)
      const recentLogs = await base44.asServiceRole.entities.NotificationLog.filter({
        user_email: email,
        wildfire_event_id: event.id
      });
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentSend = recentLogs.find(log => 
        new Date(log.created_date) > thirtyMinutesAgo &&
        (log.severity_at_send === event.severity || 
         (log.severity_at_send === 'advisory' && event.severity === 'warning') ||
         (log.severity_at_send === 'advisory' && event.severity === 'evacuation') ||
         (log.severity_at_send === 'warning' && event.severity === 'evacuation'))
      );

      if (recentSend) {
        results.push({ email, status: 'skipped', reason: 'duplicate recent send' });
        continue;
      }

      // Send email
      const template = emailTemplates[event.severity] || emailTemplates.advisory;
      const distance = Math.round(
        Math.min(...userLocationMap[email].map(loc => 
          haversineDistance(loc.latitude, loc.longitude, event.latitude, event.longitude)
        ))
      );
      const emailData = template(event.title, distance, event.latitude, event.longitude, event.guidance_text, event.health_risk_text);

      try {
        // Use Base44 Core integration to send email
        const emailRes = await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: emailData.subject,
          body: emailData.body,
          from_name: 'Wildfire Watch'
        });

        // Log the send
        await base44.asServiceRole.entities.NotificationLog.create({
          user_email: email,
          wildfire_event_id: event.id,
          channel: 'email',
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_id: emailRes?.message_id || 'base44-email',
          severity_at_send: event.severity
        });

        results.push({ email, channel: 'email', status: 'sent' });
      } catch (err) {
        // Log the failure
        await base44.asServiceRole.entities.NotificationLog.create({
          user_email: email,
          wildfire_event_id: event.id,
          channel: 'email',
          status: 'failed',
          error_message: err.message,
          severity_at_send: event.severity
        });

        results.push({ email, channel: 'email', status: 'failed', error: err.message });
      }
    }

    return Response.json({
      event_id: event.id,
      event_title: event.title,
      affected_users: affectedEmails.size,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});