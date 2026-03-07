import React from "react";
import { Layers, TreePine, Flame, Wind, Skull, History, Radar } from "lucide-react";

const layerDefs = [
  { key: "zones", label: "Risk Zones", icon: Radar, color: "text-amber-400" },
  { key: "liveFires", label: "Live Fires (CWFIS)", icon: Flame, color: "text-red-400" },
  { key: "ndvi", label: "Vegetation (NDVI)", icon: TreePine, color: "text-green-400" },
  { key: "airQuality", label: "Air Quality", icon: Wind, color: "text-blue-400" },
  { key: "historical", label: "Historical Fires", icon: History, color: "text-orange-400" },
  { key: "envDamage", label: "Environmental Damage", icon: Skull, color: "text-purple-400" },
];

export default function LayerToggles({ layers, onChange }) {
  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-3 space-y-1 shadow-2xl max-w-[200px]">
        <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Map Layers</span>
        </div>
        {layerDefs.map((l) => (
          <button
            key={l.key}
            onClick={() => onChange(l.key)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              layers[l.key]
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <l.icon className={`w-3.5 h-3.5 ${layers[l.key] ? l.color : ""}`} />
            {l.label}
            <div className={`ml-auto w-1.5 h-1.5 rounded-full ${layers[l.key] ? "bg-green-400" : "bg-slate-600"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}