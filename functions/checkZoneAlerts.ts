import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const THREAT_ORDER = { LOW: 0, MODERATE: 1, HIGH: 2, EXTREME: 3 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch zones, alert configs, and recent alert history
    const [zones, configs] = await Promise.all([
      base44.asServiceRole.entities.MonitoredZone.filter({ status: "active" }),
      base44.asServiceRole.entities.AlertConfig.filter({ is_active: true }),
    ]);

    const triggered = [];

    for (const config of configs) {
      // Find zones in this province meeting or exceeding the threshold
      const matchingZones = zones.filter(z => {
        if (config.province && z.province !== config.province) return false;
        const zoneLevel = THREAT_ORDER[z.threat_level] ?? 0;
        const threshold = THREAT_ORDER[config.threshold_level] ?? 2;
        return zoneLevel >= threshold;
      });

      if (matchingZones.length === 0) continue;

      const topZone = matchingZones.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))[0];

      // Build alert message
      const zoneList = matchingZones.slice(0, 3).map(z => `${z.name} (${z.threat_level}, score ${z.risk_score || "?"})`).join("; ");
      const message = `⚠️ WILDFIRE ALERT: ${matchingZones.length} zone(s) in ${config.province} have reached ${config.threshold_level}+ threat level. Zones: ${zoneList}. Immediate attention may be required.`;

      // Record in-app alert history
      const alertRecord = await base44.asServiceRole.entities.AlertHistory.create({
        zone_name: topZone.name,
        org_name: config.org_name,
        threat_level: topZone.threat_level,
        risk_score: topZone.risk_score || 0,
        message,
        status: "pending",
      });

      // Send email
      let emailStatus = "sent";
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: config.contact_email,
          from_name: "Wildfire Watch Canada",
          subject: `🔥 Fire Risk Alert — ${config.province} | ${topZone.threat_level} Threat`,
          body: `
Hello ${config.org_name},

This is an automated alert from Wildfire Watch Canada.

FIRE RISK THRESHOLD REACHED
Province: ${config.province}
Threat Level: ${topZone.threat_level}
Zones Affected: ${matchingZones.length}

${zoneList}

DETAILS:
${matchingZones.slice(0, 5).map(z => `• ${z.name}: ${z.threat_level} (Score: ${z.risk_score || "?"}/100)\n  ${z.analysis_summary || "No additional analysis available."}`).join("\n\n")}

RECOMMENDATIONS:
${topZone.recommendations || "Monitor conditions closely. Follow official provincial fire agency guidance."}

---
This alert was triggered because zones in ${config.province} met or exceeded your configured threshold of "${config.threshold_level}".
Manage your alert settings at Wildfire Watch Canada.
For official information visit: https://cwfis.cfs.nrcan.gc.ca/
          `.trim(),
        });
      } catch (emailErr) {
        emailStatus = "failed";
      }

      // Update alert record status
      await base44.asServiceRole.entities.AlertHistory.update(alertRecord.id, { status: emailStatus });

      triggered.push({
        org: config.org_name,
        province: config.province,
        zonesTriggered: matchingZones.length,
        emailStatus,
      });
    }

    return Response.json({
      checked: configs.length,
      triggered: triggered.length,
      details: triggered,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});