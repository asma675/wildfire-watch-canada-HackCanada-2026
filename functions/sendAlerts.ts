import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await base44.entities.MonitoredZone.filter({ status: 'active' });
    const configs = await base44.entities.AlertConfig.filter({ is_active: true });

    const threatOrder = { LOW: 0, MODERATE: 1, HIGH: 2, EXTREME: 3 };
    const alerts = [];

    for (const zone of zones) {
      if (!zone.threat_level) continue;

      for (const cfg of configs) {
        const zoneThreat = threatOrder[zone.threat_level] || 0;
        const threshold = threatOrder[cfg.threshold_level] || 0;

        if (zoneThreat >= threshold) {
          const message = `WILDFIRE ALERT: ${zone.name} (${zone.province}) is at ${zone.threat_level} risk (score: ${zone.risk_score}/100). ${zone.analysis_summary || ''}`;

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: cfg.contact_email,
              subject: `🔥 Wildfire ${zone.threat_level} Alert — ${zone.name}`,
              body: `<h2>Wildfire Watch Canada — Alert</h2>
<p><strong>Zone:</strong> ${zone.name}, ${zone.province}</p>
<p><strong>Threat Level:</strong> ${zone.threat_level}</p>
<p><strong>Risk Score:</strong> ${zone.risk_score}/100</p>
<p><strong>Analysis:</strong> ${zone.analysis_summary || 'N/A'}</p>
<p><strong>Recommendations:</strong> ${zone.recommendations || 'N/A'}</p>
<hr>
<p><em>This is an automated alert from Wildfire Watch Canada.</em></p>`,
            });

            await base44.asServiceRole.entities.AlertHistory.create({
              zone_name: zone.name,
              org_name: cfg.org_name,
              threat_level: zone.threat_level,
              risk_score: zone.risk_score,
              message,
              status: 'sent',
            });

            alerts.push({ zone: zone.name, org: cfg.org_name, status: 'sent' });
          } catch (err) {
            await base44.asServiceRole.entities.AlertHistory.create({
              zone_name: zone.name,
              org_name: cfg.org_name,
              threat_level: zone.threat_level,
              risk_score: zone.risk_score,
              message,
              status: 'failed',
            });
            alerts.push({ zone: zone.name, org: cfg.org_name, status: 'failed', error: err.message });
          }
        }
      }
    }

    return Response.json({ success: true, alerts_sent: alerts.length, alerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});