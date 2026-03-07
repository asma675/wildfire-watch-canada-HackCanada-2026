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
  ActiveFireLayer,
} from "@/components/map/MapLayers";
import LayerToggles from "@/components/map/LayerToggles";
import ZoneInfoPanel from "@/components/map/ZoneInfoPanel";
import { X } from "lucide-react";

export default function RiskMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [layers, setLayers] = useState({
    zones: true,
    ndvi: false,
    fires: true,
    airQuality: false,
    historical: false,
    envDamage: false,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.MonitoredZone.list("-risk_score", 50),
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
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {layers.zones && <ZoneLayer zones={zones} onZoneClick={setSelectedZone} />}
          {layers.ndvi && <NDVILayer zones={zones} />}
          {layers.fires && <ActiveFireLayer zones={zones} />}
          {layers.airQuality && <AirQualityLayer stations={airQuality} />}
          {layers.historical && <HistoricalFireLayer fires={historicalFires} />}
          {layers.envDamage && <EnvironmentalDamageLayer damages={envDamage} />}
        </MapContainer>

        <LayerToggles layers={layers} onChange={toggleLayer} />
      </div>

      {/* Info Panel — Desktop: side, Mobile: bottom sheet */}
      {selectedZone && (
        <>
          {/* Desktop side panel */}
          <div className="hidden lg:block w-[380px] border-l border-white/5 bg-[#1a1a2e] overflow-hidden flex-shrink-0">
            <ZoneInfoPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
          </div>

          {/* Mobile bottom sheet */}
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