import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Shield } from "lucide-react";
import RiskMapContent from "@/components/monitoring/RiskMapContent";
import ZonesContent from "@/components/monitoring/ZonesContent";

export default function Monitoring() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-5 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Monitoring & Risk Assessment</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time maps, zones, and AI analysis</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none justify-start px-5 py-3 gap-2 h-auto">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" /> Risk Map
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Monitored Zones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="flex-1 overflow-hidden p-0 m-0">
          <RiskMapContent />
        </TabsContent>

        <TabsContent value="zones" className="flex-1 overflow-auto">
          <ZonesContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}