import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ZoneLayer,
  NDVILayer,
  HistoricalFireLayer,
  AirQualityLayer,
  EnvironmentalDamageLayer,
  LiveFireLayer,
} from "@/components/map/MapLayers";
import LayerToggles from "@/components/map/LayerToggles";
import ZoneInfoPanel from "@/components/map/ZoneInfoPanel";
import { Loader2, Flame, AlertTriangle } from "lucide-react";

export default function RiskMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [layers, setLayers] = useState({
    zones: true,
    liveFires: true,
    ndvi: false,
    airQuality: false,
    historical: false,
    envDamage: false,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.MonitoredZone.list("-risk_score", 50),
  });

  const { data: liveFireData, isLoading: loadingFires, error: fireError } = useQuery({
    queryKey: ["liveFires"],
    queryFn: () => base44.functions.invoke("fetchActiveFires", {}).then(r => r.data),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    enabled: layers.liveFires,
  });

  const { data: historicalFires = [] } = useQuery({
    queryKey: ["historicalFires"],
    queryFn: () => base44.entities.HistoricalFire.list("-year", 100),
    enabled: layers.historical,
  });

  const { data: airQuality = [] } = useQuery({
    queryKey: ["airQuality"],
    queryFn: () => base44.entities.AirQuality.list("-aqi", 100),
    enabled: layers.airQuality,
  });

  const { data: envDamage = [] } = useQuery({
    queryKey: ["envDamage"],
    queryFn: () => base44.entities.EnvironmentalDamage.list("-severity", 100),
    enabled: layers.envDamage,
  });

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fires = liveFireData?.fires || [];
  const ocFires = fires.filter(f => f.stage_of_control === "OC");

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col lg:flex-row relative">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[56.1304, -106.3468]}
          zoom={4}
          className="h-full w-full"
          zoomControl={false}
        >
          {/* Dark satellite basemap — matches Esri wildfire map */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, USGS, NOAA'
            maxZoom={19}
          />
          {/* Semi-transparent dark overlay for better contrast */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            attribution=''
            opacity={0.6}
          />

          {layers.zones && <ZoneLayer zones={zones} onZoneClick={setSelectedZone} />}
          {layers.ndvi && <NDVILayer zones={zones} />}
          {layers.liveFires && <LiveFireLayer fires={fires} />}
          {layers.airQuality && <AirQualityLayer stations={airQuality} />}
          {layers.historical && <HistoricalFireLayer fires={historicalFires} />}
          {layers.envDamage && <EnvironmentalDamageLayer damages={envDamage} />}
        </MapContainer>

        <LayerToggles layers={layers} onChange={toggleLayer} />

        {/* Live fire status badge */}
        <div className="absolute bottom-4 left-3 z-[1000] flex flex-col gap-2">
          {loadingFires && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 px-3 py-2 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading live fires…
            </div>
          )}
          {!loadingFires && fires.length > 0 && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-red-500/20 px-3 py-2 flex items-center gap-2 text-xs">
              <Flame className="w-3 h-3 text-red-400" />
              <span className="text-white font-semibold">{fires.length} active fires</span>
              {ocFires.length > 0 && (
                <span className="text-red-400">· {ocFires.length} out of control</span>
              )}
            </div>
          )}
          {!loadingFires && fires.length === 0 && !fireError && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-green-500/20 px-3 py-2 flex items-center gap-2 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              No active fires reported
            </div>
          )}
          {fireError && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-amber-500/20 px-3 py-2 flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="w-3 h-3" /> Could not load live fire data
            </div>
          )}
          <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-xl border border-white/5 px-3 py-1.5 text-[10px] text-slate-500">
            Source: CWFIS / NRCan · Updates every 3h
          </div>
        </div>

        {/* Fire legend */}
        {layers.liveFires && (
          <div className="absolute bottom-4 right-3 z-[1000] bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 space-y-1.5 text-[11px]">
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider pb-1 border-b border-white/5">Fire Status</p>
            {[
              { color: "#ef4444", label: "Out of Control" },
              { color: "#f97316", label: "Being Held" },
              { color: "#f59e0b", label: "Under Control" },
              { color: "#a78bfa", label: "Prescribed" },
              { color: "#64748b", label: "Extinguished" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Panel — Desktop: side, Mobile: bottom sheet */}
      {selectedZone && (
        <>
          <div className="hidden lg:block w-[380px] border-l border-white/5 bg-[#1a1a2e] overflow-hidden flex-shrink-0">
            <ZoneInfoPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
          </div>
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-[1100] max-h-[70vh] bg-[#1a1a2e] border-t border-white/10 rounded-t-2xl overflow-hidden shadow-2xl">
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-2 mb-1" />
            <div className="overflow-y-auto max-h-[calc(70vh-16px)]">
              <ZoneInfoPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}