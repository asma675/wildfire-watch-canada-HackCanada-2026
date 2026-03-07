import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Heart, Activity, Wind, Battery, MapPin, AlertTriangle } from "lucide-react";

const STATUS_COLORS = {
  standby:   "#64748b",
  scanning:  "#f59e0b",
  rescue:    "#ef4444",
  returning: "#3b82f6",
  charging:  "#22c55e",
  offline:   "#374151",
};

const STATUS_RADIUS = {
  standby:   8,
  scanning:  10,
  rescue:    12,
  returning: 10,
  charging:  8,
  offline:   6,
};

function severityColor(w) {
  if (!w) return null;
  if (w.alert_severity === "critical") return "#ef4444";
  if (w.alert_severity === "moderate") return "#f59e0b";
  return "#3b82f6";
}

export default function DroneMapView({ drones, wearables }) {
  const [selected, setSelected] = useState(null);

  // Drones with GPS
  const mappedDrones = drones.filter(d => d.latitude && d.longitude);
  // Wearables with GPS
  const mappedWearables = wearables.filter(w => w.latitude && w.longitude);

  const center = mappedDrones.length > 0
    ? [mappedDrones[0].latitude, mappedDrones[0].longitude]
    : [56.1304, -106.3468];

  const linkedWearable = (drone) =>
    wearables.find(w => w.id === drone.wearable_alert_id);

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      <div className="px-4 py-2 border-b border-white/5 flex flex-wrap gap-3 items-center">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 ml-2 border-l border-white/10 pl-3">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border-2 border-red-400 bg-red-400/20" />
          <span>Health Alert</span>
        </div>
        {mappedDrones.length === 0 && (
          <span className="ml-auto text-[10px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> No drones have GPS coordinates yet
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={mappedDrones.length > 0 ? 6 : 4} className="h-full w-full" zoomControl={false}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
            maxZoom={19}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.65}
          />

          {/* Wearable alert positions */}
          {mappedWearables.map(w => (
            <CircleMarker
              key={w.id}
              center={[w.latitude, w.longitude]}
              radius={9}
              pathOptions={{
                color: severityColor(w),
                fillColor: severityColor(w),
                fillOpacity: 0.25,
                weight: 2,
                dashArray: "4 3",
              }}
            >
              <Tooltip permanent={false} direction="top">
                <div className="text-xs font-semibold">{w.person_name}</div>
                <div className="text-[10px] text-slate-400">{w.alert_type} · {w.alert_severity}</div>
                {w.heart_rate && <div className="text-[10px]">❤ {w.heart_rate} BPM · O₂ {w.spo2}%</div>}
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Drone positions */}
          {mappedDrones.map(drone => {
            const color = STATUS_COLORS[drone.status] || "#64748b";
            const radius = STATUS_RADIUS[drone.status] || 8;
            const wearable = linkedWearable(drone);
            return (
              <React.Fragment key={drone.id}>
                {/* Outer pulse ring for active drones */}
                {(drone.status === "rescue" || drone.status === "scanning") && (
                  <CircleMarker
                    center={[drone.latitude, drone.longitude]}
                    radius={radius + 7}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.08, weight: 1 }}
                  />
                )}
                <CircleMarker
                  center={[drone.latitude, drone.longitude]}
                  radius={radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                  eventHandlers={{ click: () => setSelected(drone.id === selected ? null : drone.id) }}
                >
                  <Tooltip direction="top" offset={[0, -radius]}>
                    <div className="text-xs font-bold">{drone.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{drone.status} · {drone.battery_pct ?? "?"}% 🔋</div>
                    {drone.zone_name && <div className="text-[10px]">📍 {drone.zone_name}</div>}
                  </Tooltip>
                  <Popup>
                    <div className="min-w-[200px] space-y-2">
                      <div className="font-bold text-sm border-b border-slate-600 pb-1">{drone.name} <span className="text-slate-400 text-xs font-normal">({drone.drone_id})</span></div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className="text-slate-400">Status:</span>
                        <span className="capitalize font-semibold" style={{ color }}>{drone.status}</span>
                        <span className="text-slate-400">Battery:</span>
                        <span className={drone.battery_pct < 20 ? "text-red-400 font-semibold" : "text-green-400"}>{drone.battery_pct ?? "?"}%</span>
                        <span className="text-slate-400">Mission:</span>
                        <span className="capitalize">{drone.mission_type || "none"}</span>
                        <span className="text-slate-400">Province:</span>
                        <span>{drone.province || "—"}</span>
                        {drone.altitude_m && <>
                          <span className="text-slate-400">Altitude:</span>
                          <span>{drone.altitude_m}m</span>
                        </>}
                      </div>
                      {wearable && (
                        <div className="border-t border-slate-600 pt-2 space-y-1">
                          <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Linked Health Alert</div>
                          <div className="text-xs text-slate-300">{wearable.person_name}</div>
                          <div className="grid grid-cols-3 gap-1 text-[10px]">
                            {wearable.heart_rate && <span className="text-red-400">❤ {wearable.heart_rate} bpm</span>}
                            {wearable.spo2 && <span className="text-blue-400">O₂ {wearable.spo2}%</span>}
                            {wearable.co_exposure_ppm > 0 && <span className="text-amber-400">CO {wearable.co_exposure_ppm}ppm</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* No GPS hint overlay */}
        {mappedDrones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="bg-[#1a1a2e]/90 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center max-w-xs">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No GPS Data Yet</p>
              <p className="text-xs text-slate-500 mt-1">Drones will appear here once latitude/longitude coordinates are assigned.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}