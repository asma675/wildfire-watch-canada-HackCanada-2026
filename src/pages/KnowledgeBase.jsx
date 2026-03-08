import React from "react";
import RAGChat from "@/components/rag/RAGChat";

export default function KnowledgeBase() {
  return (
    <div className="bg-[#0f0f1a] h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">AI Knowledge Assistant</h1>
        <p className="text-sm text-slate-400 mt-1">Voice-enabled wildfire safety assistant — ask questions and hear the answers</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <RAGChat />
      </div>
    </div>
  );
}