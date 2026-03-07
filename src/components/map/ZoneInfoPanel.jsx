import React from "react";
import ThreatBadge from "@/components/dashboard/ThreatBadge";
import { X, MapPin, Thermometer, Droplets, Wind, TreePine, Clock, AlertTriangle } from "lucide-react";
import moment from "moment";

export default function ZoneInfoPanel({ zone, onClose }) {
  if (!zone) return null;

  const riskColor = zone.risk_score >= 80 ? "text-red-400" : zone.risk_score >= 60 ? "text-orange-400" : zone.risk_score >= 40 ? "text-amber-400" : "text-green-400";
  const riskBg = zone.risk_score >= 80 ? "from-red-500/20" : zone.risk_score >= 60 ? "from-orange-500/20" : zone.risk_score >= 40 ? "from-amber-500/20" : "from-green-500/20";

  return (
    <div className="h-full flex flex-col bg-[#1a1a2e] overflow-hidden">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-b ${riskBg} to-transparent border-b border-white/5`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{zone.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">{zone.province} · {zone.latitude?.toFixed(2)}°N, {zone.longitude?.toFixed(2)}°W</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Risk Score</p>
            <p className={`text-4xl font-black ${riskColor}`}>{zone.risk_score ?? "—"}</p>
          </div>
          <ThreatBadge level={zone.threat_level} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Weather */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Weather</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/[0.03] p-3 text-center border border-white/5">
              <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{zone.weather_temp_c ?? "—"}°</p>
              <p className="text-[10px] text-slate-500">Temp</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3 text-center border border-white/5">
              <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{zone.weather_humidity ?? "—"}%</p>
              <p className="text-[10px] text-slate-500">Humidity</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3 text-center border border-white/5">
              <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{zone.weather_wind_kmh ?? "—"}</p>
              <p className="text-[10px] text-slate-500">km/h</p>
            </div>
          </div>
        </div>

        {/* Vegetation */}
        {zone.ndvi_score != null && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TreePine className="w-3 h-3" /> Vegetation Health
            </h3>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">NDVI Index</span>
                <span className="text-sm font-bold text-white">{zone.ndvi_score.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${zone.ndvi_score * 100}%`,
                    background: zone.ndvi_score < 0.3 ? "#ef4444" : zone.ndvi_score < 0.5 ? "#f59e0b" : "#22c55e",
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {zone.ndvi_score < 0.3 ? "Critical — very dry vegetation" : zone.ndvi_score < 0.5 ? "Moderate — somewhat dry" : "Healthy — normal vegetation"}
              </p>
            </div>
          </div>
        )}

        {/* Analysis */}
        {zone.analysis_summary && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> AI Analysis
            </h3>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
              <p className="text-sm text-slate-300 leading-relaxed">{zone.analysis_summary}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {zone.recommendations && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommendations</h3>
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
              <p className="text-sm text-amber-200/80 leading-relaxed">{zone.recommendations}</p>
            </div>
          </div>
        )}

        {/* Historical Context */}
        {zone.historical_fire_context && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historical Context</h3>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
              <p className="text-sm text-slate-300 leading-relaxed">{zone.historical_fire_context}</p>
            </div>
          </div>
        )}

        {/* Last Analysis */}
        {zone.last_analysis && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-2">
            <Clock className="w-3 h-3" />
            Last analyzed: {moment(zone.last_analysis).fromNow()}
          </div>
        )}
      </div>
    </div>
  );
}