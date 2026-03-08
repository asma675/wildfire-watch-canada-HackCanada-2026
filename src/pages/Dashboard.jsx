import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/dashboard/StatCard";
import ZoneCard from "@/components/dashboard/ZoneCard";
import AlertItem from "@/components/dashboard/AlertItem";
import ThreatBadge from "@/components/dashboard/ThreatBadge";
import {
  AlertTriangle, Shield, Bell, Wind, Map, ArrowRight,
  Activity, Zap, RefreshCw, Loader2, Flame, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false);

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.MonitoredZone.list("-risk_score", 50),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.AlertHistory.list("-created_date", 10),
  });

  const { data: airQuality = [] } = useQuery({
    queryKey: ["airQuality"],
    queryFn: () => base44.entities.AirQuality.list("-aqi", 50),
  });

  const { data: drones = [] } = useQuery({
    queryKey: ["drones"],
    queryFn: () => base44.entities.Drone.list("-created_date", 50),
    refetchInterval: 15000,
  });

  const extremeZones = zones.filter((z) => z.threat_level === "EXTREME");
  const highZones = zones.filter((z) => z.threat_level === "HIGH");
  const avgAqi = airQuality.length > 0 ? Math.round(airQuality.reduce((s, a) => s + (a.aqi || 0), 0) / airQuality.length) : 0;
  const maxRisk = zones.length > 0 ? Math.max(...zones.map((z) => z.risk_score || 0)) : 0;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke("analyzeZones", {});
    } catch (e) {
      console.error(e);
    }
    setAnalyzing(false);
  };

  const isLoading = zonesLoading || alertsLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time wildfire intelligence overview</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
          <Link to={createPageUrl("RiskMap")}>
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 gap-2">
              <Map className="w-4 h-4" /> View Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Threat Banner */}
      {extremeZones.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/20 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400 threat-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">EXTREME Threat Detected</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {extremeZones.map((z) => z.name).join(", ")} — immediate attention required
            </p>
          </div>
          <Link to={createPageUrl("RiskMap")}>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
              View <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Peak Risk" value={maxRisk} subtitle="Highest score" icon={Flame} color="red" pulse={maxRisk >= 80} />
        <StatCard title="Monitored Zones" value={zones.length} subtitle={`${extremeZones.length + highZones.length} elevated`} icon={Shield} color="amber" />
        <StatCard title="Alerts Sent" value={alerts.length} subtitle="Last 24h" icon={Bell} color="blue" />
        <StatCard title="Avg AQI" value={avgAqi} subtitle={avgAqi > 100 ? "Unhealthy" : avgAqi > 50 ? "Moderate" : "Good"} icon={Wind} color={avgAqi > 100 ? "red" : avgAqi > 50 ? "amber" : "green"} />
      </div>

      {/* Drone Widgets */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DronesWidget drones={drones} />
        <DroneHistoryChart drones={drones} />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Highest Risk Zones */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Highest Risk Zones
            </h2>
            <Link to={createPageUrl("Zones")} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {zones.slice(0, 5).map((zone) => (
                <ZoneCard key={zone.id} zone={zone} />
              ))}
              {zones.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No monitored zones yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Recent Alerts
            </h2>
            <Link to={createPageUrl("Alerts")} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 6).map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
            {alerts.length === 0 && !alertsLoading && (
              <div className="text-center py-12 text-slate-500 rounded-2xl border border-white/5 bg-white/[0.02]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent alerts</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="rounded-2xl border border-white/5 bg-[#1a1a2e]/50 p-4 space-y-3 mt-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Radio className="w-3 h-3 text-green-400 threat-pulse" />
              System Status
            </h3>
            <div className="space-y-2">
              {[
                { label: "Satellite Feed", status: "Online" },
                { label: "Weather Data", status: "Online" },
                { label: "NDVI Analysis", status: "Online" },
                { label: "Alert System", status: "Online" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}