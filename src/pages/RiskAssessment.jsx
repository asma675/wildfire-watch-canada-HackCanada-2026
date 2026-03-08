import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import RiskMapContent from "@/components/monitoring/RiskMapContent.jsx";

export default function RiskAssessment() {
  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-5 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Risk Assessment & Maps</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time wildfire risk maps and analysis</p>
      </div>

      <div className="flex-1 overflow-auto">
        <RiskMapContent />
      </div>
    </div>
  );
}