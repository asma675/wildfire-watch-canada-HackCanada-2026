import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Battery, MapPin, Heart, Radio, ArrowRight, Cpu, AlertTriangle } from "lucide-react";

const STATUS_STYLES = {
  standby:   { bg: "bg-slate-500/15", text: "text-slate-300", dot: "bg-slate-400", label: "Standby" },
  scanning:  { bg: "bg-blue-500/15",  text: "text-blue-300",  dot: "bg-blue-400 animate-pulse", label: "Scanning" },
  rescue:    { bg: "bg-red-500/15",   text: "text-red-300",   dot: "bg-red-400 animate-pulse",  label: "Rescue" },
  returning: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400", label: "Returning" },
  charging:  { bg: "bg-green-500/15", text: "text-green-300", dot: "bg-green-400", label: "Charging" },
  offline:   { bg: "bg-zinc-700/20",  text: "text-zinc-400",  dot: "bg-zinc-500",  label: "Offline" },
};

const BATTERY_COLOR = (pct) => pct > 60 ? "text-green-400" : pct > 25 ? "text-amber-400" : "text-red-400";
const BATTERY_BAR = (pct) => pct > 60 ? "bg-green-500" : pct > 25 ? "bg-amber-500" : "bg-red-500";

export default function DronesWidget({ drones = [] }) {
  const active = drones.filter(d => d.status !== "standby" && d.status !== "offline" && d.status !== "charging");
  const rescuing = drones.filter(d => d.status === "rescue");
  const alerts = drones.filter(d => d.person_found && d.person_status === "unconscious");

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1a1a2e]/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          Drone Fleet Status
        </h2>
        <Link to={createPageUrl("Drones")} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
          Command Centre <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300">
          <span className="font-bold text-white">{drones.length}</span> total
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300">
          <span className="font-bold">{active.length}</span> active
        </span>
        {rescuing.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="font-bold">{rescuing.length}</span> on rescue
          </span>
        )}
        {alerts.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-bold">{alerts.length}</span> critical
          </span>
        )}
      </div>

      {/* Drone list */}
      {drones.length === 0 ? (
        <div className="text-center py-6 text-slate-600 text-sm">No drones registered</div>
      ) : (
        <div className="space-y-2">
          {drones.slice(0, 5).map(drone => {
            const s = STATUS_STYLES[drone.status] || STATUS_STYLES.standby;
            const pct = drone.battery_pct ?? 100;
            return (
              <div key={drone.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                {/* Status dot + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{drone.name}</p>
                    <p className="text-[10px] text-slate-500">{drone.drone_id}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text} hidden sm:block flex-shrink-0`}>
                  {s.label}
                </span>

                {/* Location */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 hidden md:flex">
                  <MapPin className="w-3 h-3" />
                  <span className="max-w-[70px] truncate">{drone.zone_name || drone.province || "—"}</span>
                </div>

                {/* Battery */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${BATTERY_BAR(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold w-7 text-right ${BATTERY_COLOR(pct)}`}>{pct}%</span>
                </div>

                {/* Alert icon */}
                {drone.person_found && (
                  <Heart className={`w-3.5 h-3.5 flex-shrink-0 ${drone.person_status === "unconscious" ? "text-red-400 animate-pulse" : "text-amber-400"}`} />
                )}
              </div>
            );
          })}

          {drones.length > 5 && (
            <Link to={createPageUrl("Drones")} className="block text-center text-xs text-slate-500 hover:text-amber-400 py-1 transition-colors">
              +{drones.length - 5} more drones →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}