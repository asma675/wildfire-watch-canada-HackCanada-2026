import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DroneCard from "@/components/drones/DroneCard";
import WearableAlertCard from "@/components/drones/WearableAlertCard";
import DroneDetailPanel from "@/components/drones/DroneDetailPanel";
import DroneMapView from "@/components/drones/DroneMapView";
import DroneMetricsRow from "@/components/drones/DroneMetricsRow";
import {
  Plus, Zap, Radio, AlertTriangle, Heart, BrainCircuit,
  Loader2, X, Activity, Cpu, ShieldAlert, Wifi, Map, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DRONE_DEFAULTS = {
  drone_id: "",
  name: "",
  status: "standby",
  mission_type: "none",
  battery_pct: 100,
  fire_resistant: true,
  equipped_with: "First aid kit, AED, oxygen mask, emergency blanket, water supply, thermal camera, two-way audio",
  province: "BC",
};

export default function Drones() {
  const qc = useQueryClient();
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(DRONE_DEFAULTS);
  const [activeTab, setActiveTab] = useState("drones"); // drones | wearables

  const { data: drones = [], isLoading: dronesLoading } = useQuery({
    queryKey: ["drones"],
    queryFn: () => base44.entities.Drone.list("-created_date", 50),
    refetchInterval: 15000,
  });

  const { data: wearables = [], isLoading: wearablesLoading } = useQuery({
    queryKey: ["wearables"],
    queryFn: () => base44.entities.WearableAlert.filter({ resolved: false }, "-created_date", 50),
    refetchInterval: 10000,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.MonitoredZone.list("-risk_score", 10),
  });

  const createDrone = useMutation({
    mutationFn: (data) => base44.entities.Drone.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["drones"] }); setShowAddForm(false); setForm(DRONE_DEFAULTS); }
  });

  const updateDrone = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Drone.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drones"] }),
  });

  const dispatchDroneForWearable = async (wearable) => {
    // Find available drone
    const available = drones.find(d => d.status === "standby" || d.status === "charging");
    if (!available) return;
    // Update drone
    await base44.entities.Drone.update(available.id, {
      status: "rescue",
      mission_type: "person_triage",
      person_found: true,
      person_status: wearable.consciousness_status || "unknown",
      target_latitude: wearable.latitude,
      target_longitude: wearable.longitude,
      wearable_alert_id: wearable.id,
      last_seen: new Date().toISOString(),
    });
    // Update wearable
    await base44.entities.WearableAlert.update(wearable.id, {
      drone_dispatched: true,
      drone_id: available.drone_id,
      persage_notified: true,
    });
    qc.invalidateQueries({ queryKey: ["drones"] });
    qc.invalidateQueries({ queryKey: ["wearables"] });
  };

  const criticalWearables = wearables.filter(w => w.alert_severity === "critical");
  const activeDrones = drones.filter(d => d.status !== "standby" && d.status !== "offline" && d.status !== "charging");
  const selectedZone = zones.find(z => z.name === selectedDrone?.zone_name) || zones[0];
  const selectedWearable = wearables.find(w => w.id === selectedDrone?.wearable_alert_id);

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="2.5"/>
                  <path d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"/>
                  <circle cx="7" cy="7" r="2" strokeWidth="1.5"/>
                  <circle cx="17" cy="7" r="2" strokeWidth="1.5"/>
                  <circle cx="7" cy="17" r="2" strokeWidth="1.5"/>
                  <circle cx="17" cy="17" r="2" strokeWidth="1.5"/>
                </svg>
              </span>
              Drone Command Centre
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Wildfire reconnaissance · Search &amp; rescue · Health monitoring</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Register Drone
          </Button>
        </div>

        {/* Critical alert banner */}
        {criticalWearables.length > 0 && (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-center gap-3 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400">⚠ {criticalWearables.length} CRITICAL WEARABLE ALERT{criticalWearables.length > 1 ? "S" : ""}</p>
              <p className="text-xs text-slate-400">{criticalWearables.map(w => w.person_name).join(", ")} — immediate drone dispatch recommended</p>
            </div>
            <button onClick={() => setActiveTab("wearables")} className="text-xs text-red-300 font-semibold border border-red-500/30 rounded-lg px-2 py-1 hover:bg-red-500/20">
              View
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="px-5 py-3 grid grid-cols-4 gap-2">
          {[
            { label: "Total Drones", value: drones.length, icon: Cpu, color: "text-slate-300" },
            { label: "Active", value: activeDrones.length, icon: Radio, color: "text-green-400" },
            { label: "On Rescue", value: drones.filter(d => d.status === "rescue").length, icon: Heart, color: "text-red-400" },
            { label: "Health Alerts", value: wearables.length, icon: Activity, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-2 border-b border-white/5 pb-3">
          {[
            { id: "drones", label: "Drones", icon: Cpu },
            { id: "wearables", label: `Health Alerts ${wearables.length > 0 ? `(${wearables.length})` : ""}`, icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "drones" && (
            <>
              {dronesLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading drones…
                </div>
              ) : drones.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="2.5"/>
                      <path d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"/>
                      <circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/>
                      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                    </svg>
                  </div>
                  <p className="text-slate-400 font-medium">No drones registered</p>
                  <p className="text-slate-600 text-sm">Register your first wildfire drone to begin</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 mt-2">
                    <Plus className="w-4 h-4" /> Register Drone
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {drones.map(d => (
                    <DroneCard key={d.id} drone={d} onSelect={setSelectedDrone} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "wearables" && (
            <>
              <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400">
                  <span className="text-blue-300 font-semibold">Fitbit + Persage integration</span> — Connected wearables continuously stream vitals. Persage software monitors for anomalies and triggers alerts when abnormalities are detected. Critical alerts auto-notify the drone system.
                </div>
              </div>
              {wearablesLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading health alerts…
                </div>
              ) : wearables.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-8 h-8 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400 font-medium">No active health alerts</p>
                  <p className="text-slate-600 text-sm mt-1">Fitbit / Persage data streams will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wearables.map(w => (
                    <WearableAlertCard key={w.id} alert={w} onDispatch={dispatchDroneForWearable} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Drone Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Register New Drone</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "drone_id", placeholder: "Drone ID (e.g. WW-D01)", label: "Drone ID" },
                { key: "name", placeholder: "Drone name", label: "Name" },
                { key: "equipped_with", placeholder: "Equipment list", label: "Equipment" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <Input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Province</label>
                <select
                  value={form.province}
                  onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {["BC","AB","ON","QC","SK","MB","NB","NS","PE","NL","YT","NT","NU"].map(p => (
                    <option key={p} value={p} className="bg-[#1a1a2e]">{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 border-white/10 text-slate-300">Cancel</Button>
              <Button
                onClick={() => createDrone.mutate(form)}
                disabled={!form.drone_id || !form.name || createDrone.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
              >
                {createDrone.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Register
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drone Detail Panel */}
      {selectedDrone && (
        <>
          <div className="hidden lg:block w-[400px] border-l border-white/5 bg-[#1a1a2e] overflow-hidden flex-shrink-0">
            <DroneDetailPanel
              drone={selectedDrone}
              zone={selectedZone}
              wearable={selectedWearable}
              onClose={() => setSelectedDrone(null)}
              onUpdate={() => qc.invalidateQueries({ queryKey: ["drones"] })}
            />
          </div>
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-[1100] max-h-[80vh] bg-[#1a1a2e] border-t border-white/10 rounded-t-2xl overflow-hidden shadow-2xl">
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-2 mb-1" />
            <div className="overflow-y-auto max-h-[calc(80vh-20px)]">
              <DroneDetailPanel
                drone={selectedDrone}
                zone={selectedZone}
                wearable={selectedWearable}
                onClose={() => setSelectedDrone(null)}
                onUpdate={() => qc.invalidateQueries({ queryKey: ["drones"] })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}