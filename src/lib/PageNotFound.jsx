import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center mx-auto">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-white mb-2">404</h1>
          <p className="text-lg text-slate-400">Page not found</p>
          <p className="text-sm text-slate-500 mt-1">The area you're looking for hasn't been mapped yet.</p>
        </div>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}