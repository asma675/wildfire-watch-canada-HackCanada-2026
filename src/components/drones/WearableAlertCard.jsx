import React from "react";
import { Heart, Wind, Thermometer, AlertTriangle, CheckCircle2, Activity, Wifi } from "lucide-react";

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400" },
  moderate: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400" },
  low:      { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400" },
};

const ALERT_LABELS = {
  none:           "Normal",
  abnormal_hr:    "Abnormal Heart Rate",
  low_spo2:       "Low Blood Oxygen",
  unconscious:    "UNCONSCIOUS",
  co_poisoning:   "CO Poisoning",
  cardiac_event:  "CARDIAC EVENT",
  fall_detected:  "Fall Detected",
  stress_critical:"Critical Stress",
};

export default function WearableAlertCard({ alert, onDispatch }) {
  const s = SEVERITY_STYLES[alert.alert_severity] || SEVERITY_STYLES.low;
  const isCritical = alert.alert_severity === "critical";

  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">{alert.person_name}</p>
          <p className="text-[10px] text-slate-500">{alert.device_type} · {alert.device_id}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.border} ${s.text} ${s.bg}`}>
          {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
          {ALERT_LABELS[alert.alert_type] || alert.alert_type}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs">
        {alert.heart_rate && (
          <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" />
            <span className="font-bold text-white">{alert.heart_rate}</span>
            <span className="text-slate-500 text-[9px]">BPM</span>
          </div>
        )}
        {alert.spo2 && (
          <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="font-bold text-white">{alert.spo2}%</span>
            <span className="text-slate-500 text-[9px]">SpO2</span>
          </div>
        )}
        {alert.body_temp_c && (
          <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span className="font-bold text-white">{alert.body_temp_c}°</span>
            <span className="text-slate-500 text-[9px]">Temp</span>
          </div>
        )}
        {alert.co_exposure_ppm != null && (
          <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1">
            <Wind className="w-3 h-3 text-yellow-400" />
            <span className="font-bold text-white">{alert.co_exposure_ppm}</span>
            <span className="text-slate-500 text-[9px]">CO PPM</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          {alert.persage_notified
            ? <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-3 h-3" /> Persage notified</span>
            : <span className="flex items-center gap-1 text-slate-500"><Wifi className="w-3 h-3" /> Persage pending</span>}
        </div>
        {!alert.drone_dispatched && !alert.resolved && (
          <button
            onClick={() => onDispatch(alert)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Dispatch Drone
          </button>
        )}
        {alert.drone_dispatched && (
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Drone En Route
          </span>
        )}
      </div>
    </div>
  );
}