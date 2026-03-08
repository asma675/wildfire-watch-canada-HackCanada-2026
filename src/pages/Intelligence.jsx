import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Heart } from "lucide-react";
import AIIntelligenceContent from "@/components/intelligence/AIIntelligenceContent";
import HealthImpactContent from "@/components/intelligence/HealthImpactContent";

export default function Intelligence() {
  const [activeTab, setActiveTab] = useState("ai");

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-5 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Intelligence & Health Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">AI insights, health impact analysis, and wearable data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none justify-start px-5 py-3 gap-2 h-auto">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Radio className="w-4 h-4" /> AI Chatbot
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> Health Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="flex-1 overflow-auto">
          <AIIntelligenceContent />
        </TabsContent>

        <TabsContent value="health" className="flex-1 overflow-auto">
          <HealthImpactContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}