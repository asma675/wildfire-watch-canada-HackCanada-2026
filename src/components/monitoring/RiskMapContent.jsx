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
import SatelliteHotspotLayer from "@/components/map/SatelliteHotspotLayer";
import LayerToggles from "@/components/map/LayerToggles";
import ZoneInfoPanel from "@/components/map/ZoneInfoPanel";
import FirePredictionPanel from "@/components/map/FirePredictionPanel";
import TimeSlider from "@/components/map/TimeSlider";
import { Loader2, Flame, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";

const DATA_SOURCES = [
  {
    title: "NASA FIRMS Satellite Hotspots",
    desc: "Real-time VIIRS (375m) & MODIS (1km) thermal anomalies from NASA satellites — updated every overpass (~3h).",
    update: "Every ~3 hours",
    color: "#f97316",
    url: "https://firms.modaps.eosdis.nasa.gov/",
  },
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

export default function RiskMapContent() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [showPredictionPanel, setShowPredictionPanel] = useState(false);
  const [predictionDay, setPredictionDay] = useState(7);
  const [envDamageYear, setEnvDamageYear] = useState(null);
  const [layers, setLayers] = useState({
    zones: true,
    liveFires: true,
    satelliteHotspots: true,
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

  const { data: hotspotData, isLoading: loadingHotspots } = useQuery({
    queryKey: ["satelliteHotspots"],
    queryFn: () => base44.functions.invoke("fetchSatelliteHotspots", { source: "VIIRS_SNPP_NRT", days: 2 }).then(r => r.data),
    enabled: layers.satelliteHotspots,
    refetchInterval: 3 * 60 * 60 * 1000,
    staleTime: 2 * 60 * 60 * 1000,
  });

  const { data: predictionData, isLoading: loadingPredictions, refetch: refetchPredictions } = useQuery({
    queryKey: ["firePredictions"],
    queryFn: () => base44.functions.invoke("predictFireRisk", {}).then(r => r.data),
    enabled: layers.firePredictions,
    staleTime: 30 * 60 * 1000,
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
    <div className="h-full w-full flex flex-col lg:flex-row relative">
      <div className="flex-1 min-h-0 relative bg-[#0f0f1a]">
        <MapContainer
          center={[56.1304, -106.3468]}
          zoom={4}
          className="!h-full !w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            maxZoom={19}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            attribution=""
            opacity={0.65}
          />

          {layers.zones && <ZoneLayer zones={zones} onZoneClick={setSelectedZone} />}
          {layers.ndvi && <NDVILayer zones={zones} />}
          {layers.satelliteHotspots && <SatelliteHotspotLayer hotspots={hotspotData?.hotspots || []} />}
          {layers.liveFires && <LiveFireLayer fires={fires} />}
          {layers.firePredictions && <FirePredictionLayer predictions={predictionData?.predictions} dayOffset={predictionDay} />}
          {layers.airQuality && <AirQualityLayer stations={airQuality} />}
          {layers.historical && <HistoricalFireLayer fires={historicalFires} />}
          {layers.envDamage && <EnvironmentalDamageLayer damages={envDamage} selectedYear={envDamageYear} />}
        </MapContainer>

        <LayerToggles layers={layers} onChange={toggleLayer} />

        {layers.firePredictions && !loadingPredictions && predictionData?.predictions?.length > 0 && (
          <TimeSlider dayOffset={predictionDay} onChange={setPredictionDay} minDay={1} maxDay={14} />
        )}

        {/* Stats and controls */}
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
            </div>
          )}
        </div>
      </div>

      {selectedZone && (
        <div className="hidden lg:block w-[380px] border-l border-white/5 bg-[#1a1a2e] overflow-y-auto flex-shrink-0">
          <ZoneInfoPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
        </div>
      )}

      {showPredictionPanel && !selectedZone && (
        <div className="hidden lg:block w-[380px] border-l border-white/5 bg-[#1a1a2e] overflow-y-auto flex-shrink-0">
          <FirePredictionPanel
            data={predictionData}
            loading={loadingPredictions}
            onClose={() => { setShowPredictionPanel(false); setLayers(p => ({ ...p, firePredictions: false })); }}
            onRefresh={refetchPredictions}
          />
        </div>
      )}

      {!selectedZone && !showPredictionPanel && (
        <div className="hidden lg:block w-[340px] border-l border-white/5 bg-[#1a1a2e] overflow-y-auto flex-shrink-0">
          <FireImageGallery />
        </div>
      )}
    </div>
  );
}