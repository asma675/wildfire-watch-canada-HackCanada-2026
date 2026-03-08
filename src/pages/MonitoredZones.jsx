import React from "react";
import { Shield } from "lucide-react";
import ZonesContent from "@/components/monitoring/ZonesContent.jsx";

export default function MonitoredZones() {
  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-5 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Monitored Zones</h1>
        <p className="text-sm text-slate-400 mt-1">Create and manage wildfire monitoring zones</p>
      </div>

      <div className="flex-1 overflow-auto">
        <ZonesContent />
      </div>
    </div>
  );
}