import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Monitoring", icon: Map, page: "Monitoring" },
  { name: "Alerts", icon: Bell, page: "Alerts" },
  { name: "Operations", icon: Cpu, page: "Operations" },
  { name: "Intelligence", icon: Radio, page: "Intelligence" },
  { name: "Fire Safety", icon: Flame, page: "FireSafety" },
  { name: "Fire Departments", icon: Building2, page: "FireDepartments" },
  { name: "Fire Gallery", icon: Flame, page: "FireGallery" },
  { name: "Alert Settings", icon: Bell, page: "AlertSettings" },
  { name: "Fire Alerts", icon: AlertTriangle, page: "ActiveFireAlerts" },
  { name: "User Health", icon: Activity, page: "UserHealth" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = React.useState(null);
  const [hasEvacuation, setHasEvacuation] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  // Check for evacuation alerts near user
  const { data: locations = [] } = useQuery({
    queryKey: ["savedLocations", user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : null,
    enabled: !!user?.email
  });

  const { data: events = [] } = useQuery({
    queryKey: ["wildfireEvents"],
    queryFn: () => base44.entities.WildfireEvent.filter({ status: "active" }),
    refetchInterval: 30 * 1000
  });

  React.useEffect(() => {
    if (!locations.length || !events.length) {
      setHasEvacuation(false);
      return;
    }

    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const evacAlerts = events.filter(e => e.severity === "evacuation");
    const hasNearbyEvac = evacAlerts.some(evt =>
      locations.some(loc => haversine(loc.latitude, loc.longitude, evt.latitude, evt.longitude) <= loc.alert_radius_km)
    );
    setHasEvacuation(hasNearbyEvac);
  }, [locations, events]);

  return (
    <div className={`min-h-screen flex ${hasEvacuation ? "bg-red-500/10" : "bg-[#0f0f1a]"}`}>
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
          
          {user?.role === 'admin' && (
            <>
              <div className="my-2 border-t border-white/5" />
              <Link
                to={createPageUrl("AdminAlerts")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPageName === "AdminAlerts"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${currentPageName === "AdminAlerts" ? "text-red-400" : ""}`} />
                Admin: Fire Alerts
              </Link>
            </>
          )}
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
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd0aca9b6f6b19517dd6d/84466b33c_image.png" 
              alt="Wildfire Watch Logo"
              className="w-8 h-8 object-contain"
            />
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
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {/* Emergency Banner */}
        {hasEvacuation && (
          <div className="bg-red-500 text-white px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">EVACUATION ALERT</p>
                <p className="text-sm">There is an active evacuation-level wildfire near your location</p>
              </div>
            </div>
            <Link to={createPageUrl("ActiveFireAlerts")}>
              <Button className="bg-white text-red-600 hover:bg-white/90 font-bold">
                View Details
              </Button>
            </Link>
          </div>
        )}

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