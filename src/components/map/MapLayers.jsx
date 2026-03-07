import React from "react";
import { CircleMarker, Circle, Popup, Tooltip, Marker } from "react-leaflet";
import ThreatBadge from "@/components/dashboard/ThreatBadge";
import { createFlameIcon } from "@/components/map/FireIcon";

const threatColors = {
  EXTREME: "#ef4444",
  HIGH: "#f97316",
  MODERATE: "#f59e0b",
  LOW: "#22c55e",
};

const smokeColors = {
  None: "#22c55e",
  Light: "#84cc16",
  Moderate: "#f59e0b",
  Heavy: "#f97316",
  Hazardous: "#ef4444",
};

const severityColors = {
  Low: "#f59e0b",
  Moderate: "#f97316",
  High: "#ef4444",
  Severe: "#991b1b",
};

export function ZoneLayer({ zones, onZoneClick }) {
  return zones.map((zone) => (
    <Circle
      key={zone.id}
      center={[zone.latitude, zone.longitude]}
      radius={(zone.radius_km || 25) * 1000}
      pathOptions={{
        color: threatColors[zone.threat_level] || "#22c55e",
        fillColor: threatColors[zone.threat_level] || "#22c55e",
        fillOpacity: 0.15,
        weight: 2,
      }}
      eventHandlers={{ click: () => onZoneClick(zone) }}
    >
      <Tooltip direction="top" permanent={false} className="custom-tooltip">
        <span className="text-xs font-semibold">{zone.name} — {zone.threat_level}</span>
      </Tooltip>
    </Circle>
  ));
}

export function NDVILayer({ zones }) {
  return zones.map((zone) => {
    if (!zone.ndvi_score && zone.ndvi_score !== 0) return null;
    const ndvi = zone.ndvi_score;
    const color = ndvi < 0.2 ? "#ef4444" : ndvi < 0.4 ? "#f97316" : ndvi < 0.6 ? "#f59e0b" : "#22c55e";
    return (
      <CircleMarker
        key={`ndvi-${zone.id}`}
        center={[zone.latitude, zone.longitude]}
        radius={8}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
      >
        <Tooltip>
          <div className="text-xs">
            <strong>{zone.name}</strong><br />
            NDVI: {ndvi.toFixed(2)}<br />
            {ndvi < 0.3 ? "⚠ Very Dry" : ndvi < 0.5 ? "Moderate" : "Healthy"}
          </div>
        </Tooltip>
      </CircleMarker>
    );
  });
}

export function HistoricalFireLayer({ fires }) {
  return fires.map((fire) => (
    <CircleMarker
      key={fire.id}
      center={[fire.latitude, fire.longitude]}
      radius={6}
      pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.6, weight: 1 }}
    >
      <Popup>
        <div className="text-xs space-y-1 min-w-[160px]">
          <p className="font-bold text-white text-sm">{fire.name}</p>
          <p className="text-slate-400">{fire.year} · {fire.province}</p>
          <p className="text-slate-400">Severity: {fire.severity}</p>
          {fire.area_hectares && <p className="text-slate-400">{fire.area_hectares.toLocaleString()} ha burned</p>}
          {fire.description && <p className="text-slate-300 mt-1">{fire.description}</p>}
        </div>
      </Popup>
    </CircleMarker>
  ));
}

export function AirQualityLayer({ stations }) {
  return stations.map((s) => {
    const color = s.aqi <= 50 ? "#22c55e" : s.aqi <= 100 ? "#f59e0b" : s.aqi <= 150 ? "#f97316" : "#ef4444";
    return (
      <CircleMarker
        key={s.id}
        center={[s.latitude, s.longitude]}
        radius={10}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 2 }}
      >
        <Popup>
          <div className="text-xs space-y-1 min-w-[140px]">
            <p className="font-bold text-white text-sm">{s.station_name}</p>
            <p className="text-slate-400">AQI: <span style={{ color }}>{s.aqi}</span></p>
            {s.pm25 != null && <p className="text-slate-400">PM2.5: {s.pm25} µg/m³</p>}
            <p className="text-slate-400">Smoke: {s.smoke_level || "Unknown"}</p>
          </div>
        </Popup>
      </CircleMarker>
    );
  });
}

export function EnvironmentalDamageLayer({ damages }) {
  return damages.map((d) => (
    <Circle
      key={d.id}
      center={[d.latitude, d.longitude]}
      radius={(d.radius_km || 10) * 1000}
      pathOptions={{
        color: severityColors[d.severity] || "#f97316",
        fillColor: severityColors[d.severity] || "#f97316",
        fillOpacity: 0.1,
        weight: 1,
        dashArray: "6 4",
      }}
    >
      <Popup>
        <div className="text-xs space-y-1 min-w-[160px]">
          <p className="font-bold text-white text-sm">{d.name}</p>
          <p className="text-slate-400">Severity: {d.severity}</p>
          {d.forest_loss_hectares && <p className="text-slate-400">Forest loss: {d.forest_loss_hectares.toLocaleString()} ha</p>}
          {d.ecosystem_impact && <p className="text-slate-300">{d.ecosystem_impact}</p>}
          {d.habitat_disruption && <p className="text-slate-300">{d.habitat_disruption}</p>}
        </div>
      </Popup>
    </Circle>
  ));
}

export function ActiveFireLayer({ zones }) {
  return zones
    .filter((z) => z.threat_level === "EXTREME" || z.threat_level === "HIGH")
    .map((zone) => (
      <CircleMarker
        key={`fire-${zone.id}`}
        center={[zone.latitude + 0.05, zone.longitude + 0.05]}
        radius={5}
        pathOptions={{
          color: "#ff0000",
          fillColor: "#ff4500",
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Tooltip>🔥 Active hotspot near {zone.name}</Tooltip>
      </CircleMarker>
    ));
}

// Status colours matching CWFIS convention
const socColors = {
  OC: "#ef4444",   // Out of Control — red
  BH: "#f97316",   // Being Held — orange
  UC: "#f59e0b",   // Under Control — amber
  EX: "#64748b",   // Out — grey
  Prescribed: "#a78bfa", // purple
};

const socLabel = {
  OC: "Out of Control",
  BH: "Being Held",
  UC: "Under Control",
  EX: "Extinguished",
  Prescribed: "Prescribed",
};

export function LiveFireLayer({ fires }) {
  if (!fires || fires.length === 0) return null;
  return fires.map((fire, i) => {
    const soc = fire.stage_of_control || "UC";
    const color = socColors[soc] || "#f59e0b";
    const icon = createFlameIcon(soc, fire.hectares || 0);
    // Outer glow halo radius in metres — proportional to fire size
    const haloMetres = fire.hectares > 50000 ? 80000 : fire.hectares > 10000 ? 45000 : fire.hectares > 1000 ? 20000 : fire.hectares > 100 ? 8000 : 3000;
    return (
      <React.Fragment key={`live-${i}`}>
        {/* Glowing perimeter halo */}
        <Circle
          center={[fire.lat, fire.lon]}
          radius={haloMetres}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.07,
            weight: soc === "OC" ? 2 : 1,
            opacity: soc === "OC" ? 0.7 : 0.45,
          }}
        />
      <Marker
        position={[fire.lat, fire.lon]}
        icon={icon}
      >
        <Popup>
          <div style={{ minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <strong style={{ color: "#fff", fontSize: 13 }}>{fire.firename}</strong>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 3 }}>
              {fire.province} · {fire.agency.toUpperCase()}
            </div>
            <div style={{ color, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
              ● {socLabel[soc] || soc}
            </div>
            {fire.hectares > 0 && (
              <div style={{ color: "#cbd5e1", fontSize: 11 }}>
                🌲 {fire.hectares.toLocaleString()} ha burned
              </div>
            )}
            {fire.startdate && (
              <div style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>
                Started: {fire.startdate.split(" ")[0]}
              </div>
            )}
            <div style={{ color: "#475569", fontSize: 9, marginTop: 6, borderTop: "1px solid #334155", paddingTop: 4 }}>
              Source: CWFIS / NRCan · Updates every 3h
            </div>
          </div>
        </Popup>
        <Tooltip direction="top" offset={[0, -10]}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{fire.firename} — {socLabel[soc] || soc}</span>
          {fire.hectares > 0 && <span style={{ color: "#94a3b8", fontSize: 10 }}> · {fire.hectares.toLocaleString()} ha</span>}
        </Tooltip>
      </Marker>
      </React.Fragment>
    );
  });
}