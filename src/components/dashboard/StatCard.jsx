import React from "react";

const colorMap = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: "text-red-400" },
  green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: "text-green-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: "text-blue-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-400" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "amber", pulse }) {
  const c = colorMap[color] || colorMap.amber;
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-5 transition-all hover:scale-[1.02] ${pulse ? "pulse-glow" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/5`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${c.bg} opacity-30 blur-2xl`} />
    </div>
  );
}