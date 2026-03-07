import React from "react";
import { Badge } from "@/components/ui/badge";
import { Battery, MapPin, Zap, Heart, AlertTriangle, CheckCircle2, Radio } from "lucide-react";

const STATUS_STYLES = {
  standby:  { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", dot: "bg-slate-400" },
  scanning: { bg: "bg-blue-500/20",  text: "text-blue-300",  border: "border-blue-500/30",  dot: "bg-blue-400" },
  rescue:   { bg: "bg-red-500/20",   text: "text-red-300",   border: "border-red-500/30",   dot: "bg-red-400" },
  returning:{ bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", dot: "bg-amber-400" },
  charging: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", dot: "bg-green-400" },
  offline:  { bg: "bg-zinc-700/30",  text: "text-zinc-400",  border: "border-zinc-600/30",  dot: "bg-zinc-500" },
};

const BATTERY_COLOR = (pct) => pct > 60 ? "text-green-400" : pct > 25 ? "text-amber-400" : "text-red-400";

export default function DroneCard({ drone, onSelect }) {
  const s = STATUS_STYLES[drone.status] || STATUS_STYLES.standby;

  return (
    <button
      onClick={() => onSelect(drone)}
      className="w-full text-left rounded-2xl border border-white/8 bg-[#1a1a2e]/60 hover:bg-[#1a1a2e]/90 transition-all p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${s.bg} border ${s.border}`}>
            {/* Drone SVG icon */}
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${s.text}`} fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="2.5"/>
              <path d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"/>
              <circle cx="7" cy="7" r="2" strokeWidth="1.5"/>
              <circle cx="17" cy="7" r="2" strokeWidth="1.5"/>
              <circle cx="7" cy="17" r="2" strokeWidth="1.5"/>
              <circle cx="17" cy="17" r="2" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{drone.name}</p>
            <p className="text-xs text-slate-500">{drone.drone_id}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text} border ${s.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${drone.status === 'rescue' || drone.status === 'scanning' ? 'animate-pulse' : ''}`} />
          {drone.status?.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
          <Battery className={`w-3.5 h-3.5 ${BATTERY_COLOR(drone.battery_pct ?? 100)}`} />
          <span className={`font-bold ${BATTERY_COLOR(drone.battery_pct ?? 100)}`}>{drone.battery_pct ?? 100}%</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 truncate text-center leading-tight">{drone.zone_name || drone.province || "—"}</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
          {drone.person_found
            ? <Heart className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            : <Radio className="w-3.5 h-3.5 text-slate-500" />}
          <span className={drone.person_found ? "text-red-300 text-center leading-tight" : "text-slate-500"}>
            {drone.person_found ? (drone.person_status || "found") : "No contact"}
          </span>
        </div>
      </div>

      {drone.mission_type && drone.mission_type !== "none" && (
        <div className="text-[10px] text-slate-500 bg-white/5 rounded-lg px-2 py-1 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400/60 flex-shrink-0" />
          Mission: <span className="text-slate-300">{drone.mission_type.replace(/_/g, " ")}</span>
        </div>
      )}
    </button>
  );
}