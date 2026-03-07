import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { X, BrainCircuit, Loader2, MapPin, Battery, Zap, Heart, ShieldCheck, Package, MessageCircle, Thermometer, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvacuationPanel from "./EvacuationPanel";

export default function DroneDetailPanel({ drone, zone, wearable, onClose, onUpdate }) {
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);

  const getGuidance = async (mode) => {
    setLoading(true);
    setActiveMode(mode);
    setGuidance("");
    try {
      const res = await base44.functions.invoke("droneAIGuidance", { mode, drone, wearable: wearable || null, zone: zone || null });
      setGuidance(res.data?.guidance || "No guidance returned.");
    } catch (err) {
      setGuidance("AI guidance temporarily unavailable. Please try again.");
    }
    setLoading(false);
  };

  const dispatchRescue = async () => {
    try {
      await base44.entities.Drone.update(drone.id, {
        status: "rescue",
        mission_type: wearable ? "person_triage" : "fire_scan",
        last_seen: new Date().toISOString(),
      });
      if (onUpdate) onUpdate();
      getGuidance(wearable ? "rescue_guidance" : "fire_scan");
    } catch (err) {
      setGuidance("Failed to dispatch drone. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="2.5"/>
              <path d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"/>
              <circle cx="7" cy="7" r="2" strokeWidth="1.5"/>
              <circle cx="17" cy="7" r="2" strokeWidth="1.5"/>
              <circle cx="7" cy="17" r="2" strokeWidth="1.5"/>
              <circle cx="17" cy="17" r="2" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{drone.name}</h2>
            <p className="text-xs text-slate-500">{drone.drone_id} · {drone.status?.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Battery className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{drone.battery_pct ?? 100}%</p>
            <p className="text-[10px] text-slate-500">Battery</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <MapPin className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white truncate">{drone.zone_name || drone.province || "—"}</p>
            <p className="text-[10px] text-slate-500">Location</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">Fire Res.</p>
            <p className="text-[10px] text-slate-500">{drone.fire_resistant ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Equipment */}
        {drone.equipped_with && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-3 h-3" /> Onboard Equipment
            </p>
            <p className="text-xs text-slate-300">{drone.equipped_with}</p>
          </div>
        )}

        {/* Person status */}
        {drone.person_found && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 animate-pulse" /> Person Located
            </p>
            <p className="text-xs text-slate-300 mt-1">Status: <span className="font-semibold text-white capitalize">{drone.person_status}</span></p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={dispatchRescue}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {drone.status === "rescue" ? "Re-run Mission AI" : "Dispatch + Get AI Mission Plan"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 gap-1.5 text-xs"
              onClick={() => getGuidance("fire_scan")} disabled={loading}>
              <BrainCircuit className="w-3.5 h-3.5 text-pink-400" /> Fire Scan Brief
            </Button>
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 gap-1.5 text-xs"
              onClick={() => getGuidance("rescue_guidance")} disabled={loading}>
              <MessageCircle className="w-3.5 h-3.5 text-green-400" /> Rescue Guidance
            </Button>
          </div>
          <Button variant="outline"
            className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10 gap-2 text-xs"
            onClick={() => getGuidance("thermal_scan")} disabled={loading}>
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            Thermal Imaging Scan — See Through Walls
          </Button>
        </div>

        {/* Mission notes */}
        {drone.mission_notes && !guidance && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Last Mission Log</p>
            <p className="text-xs text-slate-300 whitespace-pre-line">{drone.mission_notes}</p>
          </div>
        )}

        {/* AI Guidance output */}
        {loading && (
          <div className="flex items-center gap-3 text-sm py-4" style={{color: activeMode === "thermal_scan" ? "#fb923c" : "#f472b6"}}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {activeMode === "thermal_scan"
                ? "Running infrared thermal scan through walls…"
                : activeMode === "rescue_guidance"
                ? "AI generating rescue plan…"
                : "AI analyzing zone…"}
            </span>
          </div>
        )}
        {guidance && (
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${activeMode === "thermal_scan" ? "text-orange-400" : "text-pink-400"}`}>
              {activeMode === "thermal_scan"
                ? <><Thermometer className="w-3 h-3" /> Thermal Imaging Report</>
                : <><BrainCircuit className="w-3 h-3" /> AI Mission Guidance</>}
            </p>
            <div className="prose prose-sm prose-invert max-w-none text-xs [&>*]:text-slate-300 [&>h1,&>h2,&>h3]:text-white [&>h1,&>h2,&>h3]:font-semibold [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
              <ReactMarkdown>{guidance}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}