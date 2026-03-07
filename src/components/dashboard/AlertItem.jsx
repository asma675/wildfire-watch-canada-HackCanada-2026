import React from "react";
import ThreatBadge from "./ThreatBadge";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import moment from "moment";

const statusIcons = {
  sent: { icon: CheckCircle, color: "text-green-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  pending: { icon: Clock, color: "text-amber-400" },
};

export default function AlertItem({ alert }) {
  const s = statusIcons[alert.status] || statusIcons.pending;
  const StatusIcon = s.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="p-2 rounded-lg bg-amber-500/10">
        <Bell className="w-4 h-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white truncate">{alert.zone_name}</span>
          <ThreatBadge level={alert.threat_level} />
        </div>
        <p className="text-xs text-slate-400 mt-1">To: {alert.org_name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{moment(alert.created_date).fromNow()}</p>
      </div>
      <StatusIcon className={`w-4 h-4 ${s.color} flex-shrink-0 mt-1`} />
    </div>
  );
}