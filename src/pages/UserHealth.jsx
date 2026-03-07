import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Heart, MapPin, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Loader2, Activity, Shield, Radio, Zap, Bell, X, RefreshCw,
  Navigation, Users, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreatBadge from "@/components/dashboard/ThreatBadge";

// ── Simulated Presage consciousness check ──────────────────────────────────
function simulatePresageCheck() {
  // Simulates calling a Presage wearable/sensor API
  // In production this would call: POST https://api.presage.io/v1/consciousness
  const motionScore = 0.4 + Math.random() * 0.6;   // 0–1 motion level
  const heartRateVariability = 30 + Math.random() * 50;
  const conscious = motionScore > 0.35 && heartRateVariability > 28;
  return { conscious, motionScore: +motionScore.toFixed(2), heartRateVariability: +heartRateVariability.toFixed(0), source: "Presage (simulated)" };
}

// ── Simulated Tailscale mesh relay ────────────────────────────────────────
function simulateTailscaleRelay(message) {
  // Simulates Tailscale device mesh: find nearby peers and relay the alert
  // In production: GET https://api.tailscale.com/api/v2/tailnet/-/devices
  const peers = [
    { id: "node-bc-kelowna-01", name: "Kelowna Relay Node", ip: "100.64.0.1", online: true },
    { id: "node-bc-penticton-02", name: "Penticton Relay Node", ip: "100.64.0.2", online: true },
    { id: "node-bc-van-03", name: "Vancouver Central Node", ip: "100.64.0.3", online: false },
  ];
  const hops = [];
  let delivered = false;
  for (const peer of peers) {
    if (peer.online) {
      hops.push({ node: peer.name, ip: peer.ip, status: "relayed" });
      delivered = true;
      break;
    }
    hops.push({ node: peer.name, ip: peer.ip, status: "offline" });
  }
  return { delivered, hops, message, source: "Tailscale Mesh (simulated)" };
}

// ── Haversine distance (km) ────────────────────────────────────────────────
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Status pill ───────────────────────────────────────────────────────────
function StatusPill({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ok ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400 threat-pulse"}`} />
      {label}
    </span>
  );
}

export default function UserHealth() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locating, setLocating] = useState(false);

  const [presageResult, setPresageResult] = useState(null);
  const [checkingPresage, setCheckingPresage] = useState(false);

  const [tailscaleResult, setTailscaleResult] = useState(null);
  const [relaying, setRelaying] = useState(false);

  const [emergencyLog, setEmergencyLog] = useState([]);
  const [monitoring, setMonitoring] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const monitorRef = useRef(null);

  const [nearbyZones, setNearbyZones] = useState([]);
  const [closestZone, setClosestZone] = useState(null);
  const [locationName, setLocationName] = useState(null);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.MonitoredZone.list("-risk_score", 50),
  });

  // ── Step 1: Get GPS location ───────────────────────────────────────────
  const getLocation = () => {
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLocating(false);
        addLog("info", `GPS location acquired: ${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W`);

        // Reverse-geocode with Nominatim (free, no key needed)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const name = data.address?.city || data.address?.town || data.address?.village || data.display_name?.split(",")[0];
          setLocationName(name);
          addLog("info", `Location resolved: ${name}`);
        } catch {
          setLocationName(null);
        }
      },
      (err) => {
        // If browser blocks geolocation, use a simulated Toronto location
        const lat = 43.6532, lon = -79.3832;
        setLocation({ latitude: lat, longitude: lon, simulated: true });
        setLocating(false);
        setLocationName("Toronto (simulated)");
        addLog("warn", "GPS unavailable — using simulated Toronto location for demo.");
      },
      { timeout: 8000 }
    );
  };

  // ── Compute nearby fire zones whenever location or zones change ────────
  useEffect(() => {
    if (!location || zones.length === 0) return;
    const withDist = zones
      .map((z) => ({ ...z, distanceKm: distanceKm(location.latitude, location.longitude, z.latitude, z.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const within200 = withDist.filter((z) => z.distanceKm <= 200);
    setNearbyZones(within200);
    setClosestZone(withDist[0]);

    if (within200.length > 0) {
      addLog("warn", `${within200.length} fire zone(s) within 200 km detected.`);
    } else {
      addLog("info", "No active fire zones within 200 km.");
    }
  }, [location, zones]);

  // ── Step 2: Presage consciousness check ───────────────────────────────
  const runPresageCheck = () => {
    setCheckingPresage(true);
    setPresageResult(null);
    addLog("info", "Contacting Presage sensor API…");

    setTimeout(() => {
      const result = simulatePresageCheck();
      setPresageResult(result);
      setCheckingPresage(false);

      if (result.conscious) {
        addLog("info", `Presage: User conscious. Motion=${result.motionScore}, HRV=${result.heartRateVariability}ms`);
      } else {
        addLog("critical", `Presage: User appears UNCONSCIOUS. Motion=${result.motionScore}, HRV=${result.heartRateVariability}ms`);
        triggerEmergencyProtocol(result);
      }
    }, 1800);
  };

  // ── Emergency protocol when unconscious ───────────────────────────────
  const triggerEmergencyProtocol = async (presageData) => {
    setAlertSent(false);
    addLog("critical", "EMERGENCY PROTOCOL ACTIVATED — alerting firefighters…");

    // 1. Attempt direct internet alert via email
    const zone = closestZone;
    const alertMsg = `EMERGENCY: User may be unconscious near ${locationName || (location ? `${location.latitude.toFixed(3)}°N, ${Math.abs(location.longitude).toFixed(3)}°W` : "unknown location")}. Closest fire zone: ${zone?.name || "N/A"} (${zone?.threat_level || "N/A"}). Presage data: Motion=${presageData.motionScore}, HRV=${presageData.heartRateVariability}ms. Immediate assistance required.`;

    try {
      await base44.integrations.Core.SendEmail({
        to: "emergency@bcwildfire.gov.bc.ca",
        subject: "🚨 EMERGENCY: Possible Unconscious Person in Fire Zone — Wildfire Watch Canada",
        body: alertMsg,
      });
      addLog("info", "Direct internet alert sent to BC Wildfire Service.");
      setAlertSent(true);
    } catch {
      addLog("warn", "Direct internet alert failed — initiating Tailscale mesh relay…");
      // 2. Fallback: Tailscale mesh relay
      runTailscaleRelay(alertMsg);
    }

    // 3. Wake-up notification (browser notification + audio cue simulation)
    addLog("info", "Sending wake-up notification to user device…");
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⚠️ Wildfire Watch: Are you OK?", {
        body: "We detected you may be unconscious near a fire zone. If you can read this, tap to confirm you are safe.",
        requireInteraction: true,
      });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("⚠️ Wildfire Watch: Are you OK?", {
            body: "We detected you may be unconscious near a fire zone. Tap to confirm you are safe.",
            requireInteraction: true,
          });
        }
      });
    }
    addLog("info", "Wake-up notification dispatched.");
  };

  // ── Tailscale relay ───────────────────────────────────────────────────
  const runTailscaleRelay = (message) => {
    setRelaying(true);
    addLog("info", "Scanning Tailscale mesh for online peers…");

    setTimeout(() => {
      const result = simulateTailscaleRelay(message || "Test relay message from Wildfire Watch Canada.");
      setTailscaleResult(result);
      setRelaying(false);

      if (result.delivered) {
        addLog("info", `Tailscale: Alert relayed via ${result.hops.find(h => h.status === "relayed")?.node}`);
        setAlertSent(true);
      } else {
        addLog("critical", "Tailscale: All peer nodes offline. Alert could not be relayed.");
      }
    }, 2000);
  };

  // ── Continuous monitoring ─────────────────────────────────────────────
  const startMonitoring = () => {
    setMonitoring(true);
    addLog("info", "Continuous monitoring started (30s intervals).");
    monitorRef.current = setInterval(() => {
      addLog("info", "Auto Presage check…");
      runPresageCheck();
    }, 30000);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    clearInterval(monitorRef.current);
    addLog("info", "Monitoring paused.");
  };

  useEffect(() => () => clearInterval(monitorRef.current), []);

  // ── Log helper ────────────────────────────────────────────────────────
  const addLog = (level, message) => {
    setEmergencyLog((prev) => [{ level, message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));
  };

  // ── UI helpers ────────────────────────────────────────────────────────
  const inFireZone = nearbyZones.some((z) => z.distanceKm <= (z.radius_km || 25));
  const nearFireZone = nearbyZones.length > 0;

  const logColors = { info: "text-slate-400", warn: "text-amber-400", critical: "text-red-400" };
  const logDots = { info: "bg-slate-500", warn: "bg-amber-400", critical: "bg-red-500 threat-pulse" };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Heart className="w-7 h-7 text-red-400" />
          User Health Monitor
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time personal safety monitoring — location, consciousness, and mesh-relay alerts
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <strong className="text-amber-400">Simulation Notice:</strong> Presage and Tailscale integrations run in simulated mode for demonstration. In a production deployment, these would connect to real Presage wearable sensors and a configured Tailscale mesh network. Google Maps geolocation uses the browser's native GPS API.
        </p>
      </div>

      {/* 3-column cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Card: Location */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Navigation className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Your Location</h2>
          </div>

          {location ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-medium">{locationName || "Location acquired"}</p>
              <p className="text-[10px] text-slate-500 font-mono">{location.latitude.toFixed(4)}°N, {Math.abs(location.longitude).toFixed(4)}°W</p>
              {location.simulated && <StatusPill ok={false} label="Simulated" />}
              <div className={`mt-2 rounded-xl p-3 border ${inFireZone ? "bg-red-500/10 border-red-500/20" : nearFireZone ? "bg-amber-500/10 border-amber-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                {inFireZone ? (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Inside fire zone!</p>
                ) : nearFireZone ? (
                  <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> {nearbyZones.length} zone(s) within 200km</p>
                ) : (
                  <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> No nearby fire zones</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No location data yet.</p>
          )}

          <Button onClick={getLocation} disabled={locating} size="sm" className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 gap-1.5 text-xs">
            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            {locating ? "Locating…" : location ? "Refresh Location" : "Get My Location"}
          </Button>
        </div>

        {/* Card: Presage */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Consciousness Check</h2>
          </div>

          {presageResult ? (
            <div className="space-y-2">
              <StatusPill ok={presageResult.conscious} label={presageResult.conscious ? "Conscious" : "Unresponsive"} />
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Motion Index</span>
                  <span className="text-white font-medium">{presageResult.motionScore}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${presageResult.motionScore * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">HRV</span>
                  <span className="text-white font-medium">{presageResult.heartRateVariability} ms</span>
                </div>
              </div>
              {!presageResult.conscious && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400 font-semibold">
                  Emergency protocol triggered
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Run a check to assess consciousness status using Presage sensor data.</p>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={runPresageCheck} disabled={checkingPresage || !location} size="sm" className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20 gap-1.5 text-xs">
              {checkingPresage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
              {checkingPresage ? "Checking…" : "Check Now"}
            </Button>
            <Button onClick={monitoring ? stopMonitoring : startMonitoring} disabled={!location} size="sm" variant="outline" className={`w-full gap-1.5 text-xs border ${monitoring ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-white/10 text-slate-400"}`}>
              <Radio className={`w-3 h-3 ${monitoring ? "threat-pulse" : ""}`} />
              {monitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </div>

        {/* Card: Tailscale */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Tailscale Mesh Relay</h2>
          </div>

          {tailscaleResult ? (
            <div className="space-y-2">
              <StatusPill ok={tailscaleResult.delivered} label={tailscaleResult.delivered ? "Delivered" : "Failed"} />
              <div className="space-y-1 pt-1">
                {tailscaleResult.hops.map((hop, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hop.status === "relayed" ? "bg-green-400" : "bg-slate-600"}`} />
                    <span className={hop.status === "relayed" ? "text-green-400" : "text-slate-500"}>{hop.node}</span>
                    <span className="text-slate-600 font-mono ml-auto">{hop.ip}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Relay is used automatically when internet is unavailable. Test it manually below.</p>
          )}

          <Button onClick={() => runTailscaleRelay()} disabled={relaying} size="sm" className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/20 gap-1.5 text-xs">
            {relaying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
            {relaying ? "Relaying…" : "Test Relay"}
          </Button>
        </div>
      </div>

      {/* Nearby Zones Table */}
      {nearbyZones.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Nearby Fire Zones ({nearbyZones.length})
          </h2>
          <div className="space-y-2">
            {nearbyZones.map((z) => (
              <div key={z.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{z.name}</p>
                  <p className="text-xs text-slate-400">{z.province} · {z.distanceKm.toFixed(0)} km away</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-300">{z.risk_score ?? "—"}</span>
                  <ThreatBadge level={z.threat_level} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Log */}
      <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Activity Log
          </h2>
          {emergencyLog.length > 0 && (
            <button onClick={() => setEmergencyLog([])} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {emergencyLog.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No activity yet. Start by getting your location.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {emergencyLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${logDots[entry.level]}`} />
                <span className="text-slate-500 font-mono flex-shrink-0">{entry.time}</span>
                <span className={logColors[entry.level]}>{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert confirmation */}
      {alertSent && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">Emergency alert delivered</p>
            <p className="text-xs text-slate-400">Firefighters have been notified of your location and status.</p>
          </div>
        </div>
      )}
    </div>
  );
}