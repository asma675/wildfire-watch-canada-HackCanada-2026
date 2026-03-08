import React from "react";
import { Camera } from "lucide-react";
import FieldImagingContent from "@/components/operations/FieldImagingContent.jsx";

export default function Operations() {
  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-[#0f0f1a]">
      <div className="px-6 py-5 border-white/5 border-b">
        <h1 className="text-3xl font-bold text-white">Field Imaging Operations</h1>
        <p className="text-base text-slate-400 mt-2">Capture and analyze field images for wildfire detection</p>
      </div>

      <div className="flex-1 overflow-auto">
        <FieldImagingContent />
      </div>
    </div>
  );
}