import React from "react";
import { Thermometer, Droplets, Wind, CloudRain, TrendingUp, TrendingDown } from "lucide-react";

// Returns a risk color for a weather metric
function tempRisk(t) {
  if (t == null) return "text-slate-400";
  if (t >= 35) return "text-red-400";
  if (t >= 28) return "text-orange-400";
  if (t >= 20) return "text-yellow-400";
  return "text-blue-400";
}
function humidityRisk(h) {
  if (h == null) return "text-slate-400";
  if (h <= 20) return "text-red-400";
  if (h <= 35) return "text-orange-400";
  if (h <= 50) return "text-yellow-400";
  return "text-blue-400";
}
function windRisk(w) {
  if (w == null) return "text-slate-400";
  if (w >= 60) return "text-red-400";
  if (w >= 40) return "text-orange-400";
  if (w >= 20) return "text-yellow-400";
  return "text-slate-400";
}
function precipSafe(p) {
  if (p == null) return "text-slate-400";
  if (p >= 20) return "text-blue-400";
  if (p >= 5) return "text-slate-400";
  return "text-red-400"; // very dry = bad
}

export default function WeatherCard({ prediction }) {
  const { temp_c, precip_mm, wind_kmh, humidity_pct, weather_summary, temp_anomaly } = prediction;
  if (temp_c == null && wind_kmh == null && humidity_pct == null) return null;

  return (
    <div className="bg-[#0f0f1a]/60 border border-white/8 rounded-xl p-3 space-y-2">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weather Forecast</p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {temp_c != null && (
          <div className="flex items-center gap-2">
            <Thermometer className={`w-3.5 h-3.5 flex-shrink-0 ${tempRisk(temp_c)}`} />
            <div>
              <div className={`text-sm font-bold ${tempRisk(temp_c)}`}>{temp_c}°C</div>
              <div className="text-[9px] text-slate-600 leading-none">Max temp</div>
            </div>
            {temp_anomaly != null && (
              <span className={`ml-auto text-[9px] flex items-center gap-0.5 ${temp_anomaly > 0 ? "text-red-400" : "text-blue-400"}`}>
                {temp_anomaly > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {temp_anomaly > 0 ? "+" : ""}{temp_anomaly}°
              </span>
            )}
          </div>
        )}

        {humidity_pct != null && (
          <div className="flex items-center gap-2">
            <Droplets className={`w-3.5 h-3.5 flex-shrink-0 ${humidityRisk(humidity_pct)}`} />
            <div>
              <div className={`text-sm font-bold ${humidityRisk(humidity_pct)}`}>{humidity_pct}%</div>
              <div className="text-[9px] text-slate-600 leading-none">Humidity</div>
            </div>
          </div>
        )}

        {wind_kmh != null && (
          <div className="flex items-center gap-2">
            <Wind className={`w-3.5 h-3.5 flex-shrink-0 ${windRisk(wind_kmh)}`} />
            <div>
              <div className={`text-sm font-bold ${windRisk(wind_kmh)}`}>{wind_kmh} km/h</div>
              <div className="text-[9px] text-slate-600 leading-none">Max wind</div>
            </div>
          </div>
        )}

        {precip_mm != null && (
          <div className="flex items-center gap-2">
            <CloudRain className={`w-3.5 h-3.5 flex-shrink-0 ${precipSafe(precip_mm)}`} />
            <div>
              <div className={`text-sm font-bold ${precipSafe(precip_mm)}`}>{precip_mm} mm</div>
              <div className="text-[9px] text-slate-600 leading-none">Precipitation</div>
            </div>
          </div>
        )}
      </div>

      {/* Risk influence bars */}
      <div className="space-y-1 pt-1 border-t border-white/5">
        <p className="text-[9px] text-slate-600 uppercase tracking-wider">Fire Risk Influence</p>
        {[
          { label: "Heat stress", pct: temp_c != null ? Math.min(100, Math.max(0, (temp_c - 10) / 30 * 100)) : 0, color: "bg-red-500" },
          { label: "Dryness", pct: humidity_pct != null ? Math.min(100, Math.max(0, (100 - humidity_pct) / 80 * 100)) : 0, color: "bg-orange-500" },
          { label: "Wind spread", pct: wind_kmh != null ? Math.min(100, wind_kmh / 80 * 100) : 0, color: "bg-yellow-500" },
          { label: "Fuel moisture↓", pct: precip_mm != null ? Math.min(100, Math.max(0, (20 - precip_mm) / 20 * 100)) : 0, color: "bg-amber-600" },
        ].map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[9px] text-slate-600 w-24 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[9px] text-slate-600 w-6 text-right">{Math.round(pct)}%</span>
          </div>
        ))}
      </div>

      {weather_summary && (
        <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1 border-t border-white/5">{weather_summary}</p>
      )}
    </div>
  );
}