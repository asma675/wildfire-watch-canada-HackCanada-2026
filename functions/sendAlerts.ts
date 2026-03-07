import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const zones = await base44.asServiceRole.entities.MonitoredZone.list();
    const configs = await base44.asServiceRole.entities.AlertConfig.filter({ is_active: true });
    const sent = [];

    for (const cfg of configs) {
      const thresholdOrder = ["LOW", "MODERATE", "HIGH", "EXTREME"];
      const thresholdIdx = thresholdOrder.indexOf(cfg.threshold_level);

      const triggeredZones = zones.filter(z => {
        const zoneIdx = thresholdOrder.indexOf(z.threat_level);
        return zoneIdx >= thresholdIdx && (cfg.province === z.province || !cfg.province);
      });

      for (const zone of triggeredZones) {
        const message = `WILDFIRE ALERT: ${zone.name} (${zone.province}) is at ${zone.threat_level} risk. Score: ${zone.risk_score}/100. ${zone.recommendations || "Take immediate precautions."}`;

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: cfg.contact_email,
            subject: `[Wildfire Watch Canada] ${zone.threat_level} Alert — ${zone.name}`,
            body: `${message}\n\nThis is an automated alert from Wildfire Watch Canada.\nZone: ${zone.name}\nProvince: ${zone.province}\nThreat Level: ${zone.threat_level}\nRisk Score: ${zone.risk_score}/100\n\nRecommendations: ${zone.recommendations || "Monitor conditions closely."}`
          });

          await base44.asServiceRole.entities.AlertHistory.create({
            zone_name: zone.name,
            org_name: cfg.org_name,
            threat_level: zone.threat_level,
            risk_score: zone.risk_score,
            message,
            status: "sent",
          });
          sent.push({ zone: zone.name, org: cfg.org_name });
        } catch (e) {
          await base44.asServiceRole.entities.AlertHistory.create({
            zone_name: zone.name,
            org_name: cfg.org_name,
            threat_level: zone.threat_level,
            risk_score: zone.risk_score,
            message,
            status: "failed",
          });
        }
      }
    }

    return Response.json({ success: true, alerts_sent: sent.length, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});