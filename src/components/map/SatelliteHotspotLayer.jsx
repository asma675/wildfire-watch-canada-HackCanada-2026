import React from "react";
import { CircleMarker, Popup, Tooltip } from "react-leaflet";

// Color by confidence level
function hotspotColor(confidence, frp) {
  if (confidence >= 80) return "#ff2200";
  if (confidence >= 60) return "#ff6600";
  return "#ffaa00";
}

// Radius scaled by fire radiative power (FRP)
function hotspotRadius(frp) {
  if (frp > 500) return 10;
  if (frp > 100) return 7;
  if (frp > 20) return 5;
  return 3;
}

const confLabel = (c) => c >= 80 ? "High" : c >= 50 ? "Nominal" : "Low";

export default function SatelliteHotspotLayer({ hotspots = [] }) {
  if (!hotspots.length) return null;

  return hotspots.map((h, i) => {
    const color = hotspotColor(h.confidence, h.frp);
    const r = hotspotRadius(h.frp);

    return (
      <CircleMarker
        key={`hs-${i}`}
        center={[h.lat, h.lon]}
        radius={r}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: 1,
        }}
      >
        <Tooltip direction="top" offset={[0, -r]}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            🛰 {h.satellite} · {confLabel(h.confidence)} confidence
            {h.frp > 0 && ` · ${h.frp.toFixed(0)} MW`}
          </span>
        </Tooltip>
        <Popup>
          <div style={{ minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>🛰️</span>
              <strong style={{ color: "#fff", fontSize: 13 }}>Satellite Hotspot</strong>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>
              {h.satellite} · {h.daynight === "D" ? "☀️ Daytime" : h.daynight === "N" ? "🌙 Nighttime" : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", fontSize: 11 }}>
              <span style={{ color: "#64748b" }}>Confidence</span>
              <span style={{ color, fontWeight: 700 }}>{confLabel(h.confidence)} ({h.confidence}%)</span>
              {h.frp > 0 && <>
                <span style={{ color: "#64748b" }}>Fire Power</span>
                <span style={{ color: "#f97316", fontWeight: 700 }}>{h.frp.toFixed(1)} MW</span>
              </>}
              {h.brightness && <>
                <span style={{ color: "#64748b" }}>Brightness</span>
                <span style={{ color: "#cbd5e1" }}>{h.brightness.toFixed(1)} K</span>
              </>}
              <span style={{ color: "#64748b" }}>Detected</span>
              <span style={{ color: "#cbd5e1" }}>{h.acq_date} {h.acq_time}</span>
              <span style={{ color: "#64748b" }}>Location</span>
              <span style={{ color: "#cbd5e1" }}>{h.lat.toFixed(3)}, {h.lon.toFixed(3)}</span>
            </div>
            <div style={{ color: "#475569", fontSize: 9, marginTop: 8, borderTop: "1px solid #334155", paddingTop: 4 }}>
              Source: NASA FIRMS · VIIRS/MODIS thermal anomaly
            </div>
          </div>
        </Popup>
      </CircleMarker>
    );
  });
}