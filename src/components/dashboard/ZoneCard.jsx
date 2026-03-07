import React from "react";
import ThreatBadge from "./ThreatBadge";
import { MapPin, Thermometer, Droplets, Wind } from "lucide-react";

export default function ZoneCard({ zone, onClick }) {
  const riskColor = zone.risk_score >= 80 ? "text-red-400" : zone.risk_score >= 60 ? "text-orange-400" : zone.risk_score >= 40 ? "text-amber-400" : "text-green-400";

  return (
    <button
      onClick={() => onClick?.(zone)}
      className="w-full text-left rounded-2xl border border-white/5 bg-[#1a1a2e]/80 p-4 hover:border-amber-500/20 hover:bg-[#1a1a2e] transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">{zone.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-400">{zone.province}</span>
          </div>
        </div>
        <ThreatBadge level={zone.threat_level} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {zone.weather_temp_c != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Thermometer className="w-3 h-3" /> {zone.weather_temp_c}°C
            </div>
          )}
          {zone.weather_humidity != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Droplets className="w-3 h-3" /> {zone.weather_humidity}%
            </div>
          )}
          {zone.weather_wind_kmh != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Wind className="w-3 h-3" /> {zone.weather_wind_kmh} km/h
            </div>
          )}
        </div>
        <span className={`text-2xl font-bold ${riskColor}`}>{zone.risk_score ?? "—"}</span>
      </div>
    </button>
  );
}