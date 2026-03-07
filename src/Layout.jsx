import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Map,
  Shield,
  Bell,
  Flame,
  Building2,
  Heart,
  Activity,
  Menu,
  X,
  Radio,
  AlertTriangle,
  Cpu,
  BookOpen,
  Camera
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Risk Map", icon: Map, page: "RiskMap" },
  { name: "Zones", icon: Shield, page: "Zones" },
  { name: "Alerts", icon: Bell, page: "Alerts" },
  { name: "Fire Safety", icon: Flame, page: "FireSafety" },
  { name: "Fire Departments", icon: Building2, page: "FireDepartments" },
  { name: "Drones", icon: Cpu, page: "Drones" },
  { name: "Field Imaging", icon: Camera, page: "FieldImaging" },
  { name: "AI Chat", icon: Radio, page: "AIChat" },
  { name: "Knowledge Base", icon: BookOpen, page: "KnowledgeBase" },
  { name: "Health Impact", icon: Heart, page: "HealthImpact" },
  { name: "User Health", icon: Activity, page: "UserHealth" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1a1a2e] border-r border-white/5 fixed h-full z-30">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd0aca9b6f6b19517dd6d/84466b33c_image.png" 
              alt="Wildfire Watch Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Wildfire Watch</h1>
              <p className="text-[10px] font-medium text-amber-400/80 uppercase tracking-widest">Canada</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? "text-amber-400" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex-1">
              <Radio className="w-3 h-3 text-green-400 threat-pulse" />
              <span className="text-xs text-green-400 font-medium">System Online</span>
            </div>
            <div className="ml-2">
              <NotificationBell />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Wildfire Watch</h1>
              <p className="text-[8px] text-amber-400/80 uppercase tracking-widest">Canada</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-[#1a1a2e] border-b border-white/5 p-3 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const active = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}

        {/* Footer */}
        <footer className="border-t border-white/5 py-4 px-6 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-500/50" />
              <span>For informational purposes only. Always follow official emergency guidance.</span>
            </div>
            <span>Built by Asma Ahmed · © 2025 Wildfire Watch Canada</span>
          </div>
        </footer>
      </main>
    </div>
  );
}