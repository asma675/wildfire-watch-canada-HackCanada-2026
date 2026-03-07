import React from "react";
import { Heart, Droplets, Wind, Battery, AlertTriangle } from "lucide-react";

const STATUS_STYLES = {
  standby:   { bg: "bg-slate-500/10",   text: "text-slate-400",  border: "border-slate-500/20" },
  scanning:  { bg: "bg-amber-500/10",   text: "text-amber-400",  border: "border-amber-500/20" },
  rescue:    { bg: "bg-red-500/10",     text: "text-red-400",    border: "border-red-500/30" },
  returning: { bg: "bg-blue-500/10",    text: "text-blue-400",   border: "border-blue-500/20" },
  charging:  { bg: "bg-green-500/10",   text: "text-green-400",  border: "border-green-500/20" },
  offline:   { bg: "bg-slate-800/50",   text: "text-slate-600",  border: "border-slate-700/20" },
};

export default function DroneMetricsRow({ drone, wearable, onSelect }) {
  const style = STATUS_STYLES[drone.status] || STATUS_STYLES.standby;
  const battColor = drone.battery_pct < 20 ? "text-red-400" : drone.battery_pct < 40 ? "text-amber-400" : "text-green-400";

  return (
    <button
      onClick={() => onSelect(drone)}
      className={`w-full text-left rounded-xl border ${style.border} ${style.bg} px-4 py-3 hover:brightness-110 transition-all`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Name + status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.text.replace("text-", "bg-")}`} />
          <span className="text-sm font-semibold text-white truncate">{drone.name}</span>
          <span className="text-[10px] text-slate-500">{drone.drone_id}</span>
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md ${style.bg} ${style.text} border ${style.border}`}>
            {drone.status}
          </span>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`flex items-center gap-1 text-xs ${battColor}`}>
            <Battery className="w-3.5 h-3.5" />
            <span>{drone.battery_pct ?? "?"}%</span>
          </div>

          {wearable ? (
            <>
              {wearable.heart_rate && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{wearable.heart_rate} bpm</span>
                </div>
              )}
              {wearable.spo2 && (
                <div className="flex items-center gap-1 text-xs text-blue-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>O₂ {wearable.spo2}%</span>
                </div>
              )}
              {wearable.co_exposure_ppm > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Wind className="w-3.5 h-3.5" />
                  <span>CO {wearable.co_exposure_ppm}ppm</span>
                </div>
              )}
              {wearable.alert_severity === "critical" && (
                <div className="flex items-center gap-1 text-xs text-red-400 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>CRITICAL</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-[10px] text-slate-600">No health link</span>
          )}

          {drone.zone_name && (
            <span className="text-[10px] text-slate-500 hidden sm:inline">📍 {drone.zone_name}</span>
          )}
        </div>
      </div>

      {/* Mission type if active */}
      {drone.mission_type && drone.mission_type !== "none" && (
        <p className="text-[10px] text-slate-500 mt-1 pl-4 capitalize">
          Mission: {drone.mission_type.replace(/_/g, " ")}
          {drone.person_found && <span className="text-red-400 font-semibold ml-2">· Person Located</span>}
        </p>
      )}
    </button>
  );
}