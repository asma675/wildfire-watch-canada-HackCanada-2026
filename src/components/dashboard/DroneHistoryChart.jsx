import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import { BarChart2, TrendingUp } from "lucide-react";

const STATUS_COLORS = {
  standby: "#64748b",
  scanning: "#60a5fa",
  rescue: "#f87171",
  returning: "#fbbf24",
  charging: "#4ade80",
  offline: "#374151",
};

const MISSION_COLORS = {
  fire_scan: "#f97316",
  person_triage: "#ef4444",
  rescue_assist: "#a855f7",
  patrol: "#3b82f6",
  none: "#374151",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DroneHistoryChart({ drones = [] }) {
  const [view, setView] = useState("status"); // status | mission | battery

  // Status distribution
  const statusData = useMemo(() => {
    const counts = {};
    drones.forEach(d => { counts[d.status || "standby"] = (counts[d.status || "standby"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: STATUS_COLORS[name] || "#64748b" }));
  }, [drones]);

  // Mission type distribution
  const missionData = useMemo(() => {
    const counts = {};
    drones.forEach(d => { const m = d.mission_type || "none"; counts[m] = (counts[m] || 0) + 1; });
    return Object.entries(counts)
      .filter(([k]) => k !== "none")
      .map(([name, value]) => ({ name: name.replace(/_/g, " "), value, color: MISSION_COLORS[name] || "#64748b" }));
  }, [drones]);

  // Battery levels per drone
  const batteryData = useMemo(() => {
    return drones.map(d => ({
      name: d.name,
      battery: d.battery_pct ?? 100,
      color: d.battery_pct > 60 ? "#4ade80" : d.battery_pct > 25 ? "#fbbf24" : "#f87171",
    }));
  }, [drones]);

  const chartData = view === "status" ? statusData : view === "mission" ? missionData : batteryData;

  if (drones.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1a1a2e]/50 p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          Drone Performance Metrics
        </h2>
        <div className="flex gap-1">
          {[
            { id: "status", label: "Status" },
            { id: "mission", label: "Missions" },
            { id: "battery", label: "Battery" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                view === v.id
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          {view === "battery" ? (
            <BarChart data={batteryData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="battery" radius={[4, 4, 0, 0]}>
                {batteryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={chartData} barSize={32} layout="vertical">
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend / summary row */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-white/5 pt-3">
        <div>
          <p className="text-base font-bold text-white">{drones.filter(d => d.battery_pct >= 60).length}</p>
          <p className="text-[10px] text-slate-500">Full Battery</p>
        </div>
        <div>
          <p className="text-base font-bold text-amber-400">{drones.filter(d => d.mission_type && d.mission_type !== "none").length}</p>
          <p className="text-[10px] text-slate-500">On Mission</p>
        </div>
        <div>
          <p className="text-base font-bold text-red-400">{drones.filter(d => d.person_found).length}</p>
          <p className="text-[10px] text-slate-500">Person Located</p>
        </div>
      </div>
    </div>
  );
}