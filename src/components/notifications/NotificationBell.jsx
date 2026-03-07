import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, X, AlertTriangle, CheckCircle2, Clock, RefreshCw, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const threatColors = {
  EXTREME: "text-red-400 border-red-500/30 bg-red-500/10",
  HIGH: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  MODERATE: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  LOW: "text-green-400 border-green-500/30 bg-green-500/10",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const panelRef = useRef(null);
  const qc = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alertHistory"],
    queryFn: () => base44.entities.AlertHistory.list("-created_date", 20),
    refetchInterval: 60 * 1000, // poll every minute
  });

  // Unread = alerts in the last 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = alerts.filter(a => new Date(a.created_date).getTime() > cutoff);
  const unread = recent.length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await base44.functions.invoke("checkZoneAlerts", {});
      qc.invalidateQueries({ queryKey: ["alertHistory"] });
    } finally {
      setChecking(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-semibold text-white">Alerts</span>
              {unread > 0 && (
                <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 rounded-full px-1.5 py-0.5 font-medium">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCheckNow}
                disabled={checking}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
                title="Check zones now"
              >
                {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              </div>
            )}
            {!isLoading && alerts.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                No alerts yet
              </div>
            )}
            {!isLoading && alerts.map((a) => (
              <div
                key={a.id}
                className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold border flex-shrink-0 ${threatColors[a.threat_level] || threatColors.LOW}`}>
                    {a.threat_level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-white truncate">{a.zone_name}</p>
                      <span className="text-[9px] text-slate-600 flex-shrink-0">{timeAgo(a.created_date)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{a.org_name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {a.status === "sent" ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : a.status === "failed" ? (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-500" />
                      )}
                      <span className="text-[9px] text-slate-600">Email {a.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/5">
            <Link
              to={createPageUrl("Alerts")}
              onClick={() => setOpen(false)}
              className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Manage alert settings →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}