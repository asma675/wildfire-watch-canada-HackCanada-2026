import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Flame, AlertTriangle } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-center p-6">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center mx-auto mb-6">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-black text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6">This zone is off the radar.</p>
        <Link
          to={createPageUrl("Dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}