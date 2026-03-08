import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Camera } from "lucide-react";
import DronesContent from "@/components/operations/DronesContent.jsx";
import FieldImagingContent from "@/components/operations/FieldImagingContent.jsx";

export default function Operations() {
  const [activeTab, setActiveTab] = useState("drones");

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-6 py-5 border-white/5 border-b">
        <h1 className="text-3xl font-bold text-white">Emergency Response & Operations</h1>
        <p className="text-base text-slate-400 mt-2">Drone command, rescue operations, and field imaging</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-white/5 border-white/10 border-b rounded-none justify-start px-6 py-4 gap-3 h-auto">
          <TabsTrigger value="drones" className="flex items-center gap-2 text-base">
            <Cpu className="w-5 h-5" /> Drones & Rescue
          </TabsTrigger>
          <TabsTrigger value="imaging" className="flex items-center gap-2 text-base">
            <Camera className="w-5 h-5" /> Field Imaging
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drones" className="flex-1 overflow-hidden p-0 m-0">
          <DronesContent />
        </TabsContent>

        <TabsContent value="imaging" className="flex-1 overflow-auto">
          <FieldImagingContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}