import React from "react";
import { BrainCircuit, RefreshCw, X, AlertTriangle, Clock, Zap, Loader2 } from "lucide-react";
import WeatherCard from "@/components/map/WeatherCard";

const riskColors = {
  CRITICAL: { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", dot: "bg-red-400" },
  HIGH: { text: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", dot: "bg-orange-400" },
  MODERATE: { text: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-400" },
};

export default function FirePredictionPanel({ data, loading, onClose, onRefresh }) {
  const predictions = data?.predictions || [];
  const critical = predictions.filter(p => p.risk_level === "CRITICAL");
  const high = predictions.filter(p => p.risk_level === "HIGH");
  const moderate = predictions.filter(p => p.risk_level === "MODERATE");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Fire Predictions</h2>
            <p className="text-[10px] text-slate-500">Next 7–14 days · Canada</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh analysis"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            <p className="text-sm text-slate-400 text-center">Analyzing satellite data, weather patterns &amp; drought indices…</p>
            <p className="text-xs text-slate-600 text-center">This may take 15–30 seconds</p>
          </div>
        )}

        {!loading && predictions.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            No prediction data available. Try refreshing.
          </div>
        )}

        {!loading && data?.summary && (
          <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-pink-300">AI Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {!loading && predictions.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Critical", count: critical.length, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                { label: "High", count: high.length, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                { label: "Moderate", count: moderate.length, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              ].map(item => (
                <div key={item.label} className={`${item.bg} border ${item.border} rounded-lg p-2 text-center`}>
                  <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
                  <div className="text-[10px] text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {predictions
                .sort((a, b) => b.risk_score - a.risk_score)
                .map((p, i) => {
                  const c = riskColors[p.risk_level] || riskColors.MODERATE;
                  return (
                    <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-3 space-y-2`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                            <span className="text-sm font-bold text-white">{p.region}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 ml-3.5">{p.province}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-xs font-bold ${c.text}`}>{p.risk_level}</div>
                          <div className="text-[10px] text-slate-500">Score: {p.risk_score}/100</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{p.explanation}</p>
                      <WeatherCard prediction={p} />
                      {p.risk_factors && p.risk_factors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.risk_factors.map((f, j) => (
                            <span key={j} className="bg-[#0f0f1a] border border-white/10 text-slate-400 text-[10px] rounded-md px-2 py-0.5">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {!loading && data?.generated_at && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 pt-2 border-t border-white/5">
            <Clock className="w-3 h-3" />
            Analysis generated: {new Date(data.generated_at).toLocaleString()}
          </div>
        )}

        <div className="bg-[#0f0f1a] border border-white/5 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-500/60 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Predictions are AI-generated from satellite imagery, weather forecasts, drought indices, and historical fire data. For official warnings, follow provincial fire agencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}