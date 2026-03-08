import React from "react";
import AIIntelligenceContent from "@/components/intelligence/AIIntelligenceContent.jsx";

export default function Intelligence() {
  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-5 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">AI Intelligence</h1>
        <p className="text-sm text-slate-400 mt-1">AI chatbot for wildfire insights and analysis</p>
      </div>

      <div className="flex-1 overflow-auto">
        <AIIntelligenceContent />
      </div>
    </div>
  );
}