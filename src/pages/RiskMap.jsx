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
import FirePredictionLayer from "@/components/map/FirePredictionLayer";
import LayerToggles from "@/components/map/LayerToggles";
import ZoneInfoPanel from "@/components/map/ZoneInfoPanel";
import FirePredictionPanel from "@/components/map/FirePredictionPanel";
import { Loader2, Flame, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";

const DATA_SOURCES = [
  {
    title: "Active Wildfires in Canada",
    desc: "Fire locations from provincial/territorial agencies & Parks Canada, coordinated by CIFFC & NRCan.",
    update: "Every 3 hours",
    color: "#ef4444",
    url: "https://cwfis.cfs.nrcan.gc.ca/",
  },
  {
    title: "Wildfire Smoke Forecast",
    desc: "Forecasted wildfire smoke (µg/m³) for next 2 days across Canada from BlueSky Canada's FireSmoke app.",
    update: "Every 6 hours",
    color: "#94a3b8",
    url: "https://firesmoke.ca/",
  },
  {
    title: "Active Wildfire Perimeters",
    desc: "Perimeters derived from satellite hotspots via CWFIS & NRCan.",
    update: "Every 3 hours",
    color: "#f97316",
    url: "https://cwfis.cfs.nrcan.gc.ca/",
  },
  {
    title: "Wildfire Risk Index",
    desc: "Classified from conditions reported by provincial & territorial fire management agencies.",
    update: "Daily",
    color: "#f59e0b",
    url: "https://cwfis.cfs.nrcan.gc.ca/",
  },
  {
    title: "Historic Wildfire Perimeters",
    desc: "National Burned Area Composite (NBAC) since 1986 — annual carbon emissions estimates.",
    update: "Annually (July)",
    color: "#a78bfa",
    url: "https://cwfis.cfs.nrcan.gc.ca/",
  },
];

const PROVINCIAL_LINKS = [
  { label: "BC Active Wildfire", url: "https://www2.gov.bc.ca/gov/content/safety/wildfire-status" },
  { label: "Alberta Wildfire", url: "https://www.albertafirebans.ca/" },
  { label: "Ontario Forest Fires", url: "https://www.ontario.ca/page/forest-fires" },
  { label: "Yukon Wildfires", url: "https://yukon.ca/en/fire-management" },
  { label: "New Brunswick Fire Watch", url: "https://www2.gnb.ca/content/gnb/en/departments/erd/forest/content/wildfires.html" },
  { label: "NL Wildfires", url: "https://www.gov.nl.ca/ffa/" },
  { label: "Saskatchewan Fire Bans", url: "https://www.saskatchewan.ca/residents/environment-public-health-and-safety/fire/fire-bans" },
  { label: "Nova Scotia Wildfire", url: "https://novascotia.ca/natr/forestprotection/" },
];

export default function RiskMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [showPredictionPanel, setShowPredictionPanel] = useState(false);
  const [layers, setLayers] = useState({
    zones: true,
    liveFires: true,
    firePredictions: false,
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
    refetchInterval: 5 * 60 * 1000,
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

  const { data: predictionData, isLoading: loadingPredictions, refetch: refetchPredictions } = useQuery({
    queryKey: ["firePredictions"],
    queryFn: () => base44.functions.invoke("predictFireRisk", {}).then(r => r.data),
    enabled: layers.firePredictions,
    staleTime: 30 * 60 * 1000, // cache 30 min
  });

  const toggleLayer = (key) => {
    setLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "firePredictions" && next.firePredictions) setShowPredictionPanel(true);
      if (key === "firePredictions" && !next.firePredictions) setShowPredictionPanel(false);
      return next;
    });
  };

  const fires = liveFireData?.fires || [];
  const ocFires = fires.filter(f => f.stage_of_control === "OC");
  const bhFires = fires.filter(f => f.stage_of_control === "BH");
  const ucFires = fires.filter(f => f.stage_of_control === "UC");

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
          {/* ESRI satellite basemap */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            maxZoom={19}
          />
          {/* Dark label overlay */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            attribution=""
            opacity={0.65}
          />

          {layers.zones && <ZoneLayer zones={zones} onZoneClick={setSelectedZone} />}
          {layers.ndvi && <NDVILayer zones={zones} />}
          {layers.liveFires && <LiveFireLayer fires={fires} />}
          {layers.airQuality && <AirQualityLayer stations={airQuality} />}
          {layers.historical && <HistoricalFireLayer fires={historicalFires} />}
          {layers.envDamage && <EnvironmentalDamageLayer damages={envDamage} />}
        </MapContainer>

        <LayerToggles layers={layers} onChange={toggleLayer} />

        {/* Fire stats badge — bottom left */}
        <div className="absolute bottom-4 left-3 z-[1000] flex flex-col gap-2 max-w-[220px]">
          {loadingFires && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 px-3 py-2 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" /> Loading live fires…
            </div>
          )}

          {!loadingFires && fires.length > 0 && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-red-500/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-white font-bold text-sm">{fires.length} Active Fires</span>
              </div>
              <div className="space-y-1">
                {ocFires.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Out of Control</span>
                    <span className="text-red-400 font-bold">{ocFires.length}</span>
                  </div>
                )}
                {bhFires.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />Being Held</span>
                    <span className="text-orange-400 font-bold">{bhFires.length}</span>
                  </div>
                )}
                {ucFires.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Under Control</span>
                    <span className="text-amber-400 font-bold">{ucFires.length}</span>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-white/5">
                CWFIS / NRCan · Updates every 3h
              </div>
            </div>
          )}

          {!loadingFires && fires.length === 0 && !fireError && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-green-500/20 px-3 py-2 flex items-center gap-2 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              No active fires reported
            </div>
          )}
          {fireError && (
            <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-amber-500/20 px-3 py-2 flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Could not load live fire data
            </div>
          )}

          {/* Data Sources toggle */}
          <button
            onClick={() => setShowSources(v => !v)}
            className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 px-3 py-2 flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors w-full"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="flex-1 text-left">Data Sources</span>
            {showSources ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {showSources && (
            <div className="bg-[#1a1a2e]/97 backdrop-blur-xl rounded-xl border border-white/10 p-3 space-y-3 max-h-[50vh] overflow-y-auto">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Data Feeds</p>
              {DATA_SOURCES.map((s) => (
                <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="block group">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: s.color }} />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-200 group-hover:text-amber-400 transition-colors leading-tight">{s.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.desc}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">🔄 {s.update}</p>
                    </div>
                  </div>
                </a>
              ))}
              <div className="border-t border-white/5 pt-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Regional Data</p>
                <div className="grid grid-cols-1 gap-1">
                  {PROVINCIAL_LINKS.map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend — bottom right */}
        {layers.liveFires && (
          <div className="absolute bottom-4 right-3 z-[1000] bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-white/5">Fire Status</p>
            {[
              { color: "#ef4444", label: "Out of Control", anim: "🔴" },
              { color: "#f97316", label: "Being Held", anim: "🟠" },
              { color: "#f59e0b", label: "Under Control", anim: "🟡" },
              { color: "#a78bfa", label: "Prescribed", anim: "🟣" },
              { color: "#64748b", label: "Extinguished", anim: "⚫" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-1.5 text-[10px] text-slate-500">
              Larger flame = bigger fire
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
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