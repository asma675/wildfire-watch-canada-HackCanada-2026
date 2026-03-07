import React from "react";
import { CircleMarker, Circle, Popup, Tooltip } from "react-leaflet";

const riskColors = {
  CRITICAL: "#ff1a1a",
  HIGH: "#ff6600",
  MODERATE: "#ffcc00",
};

const riskGlow = {
  CRITICAL: "rgba(255,26,26,0.18)",
  HIGH: "rgba(255,102,0,0.14)",
  MODERATE: "rgba(255,204,0,0.12)",
};

export default function FirePredictionLayer({ predictions, dayOffset = 7 }) {
  if (!predictions || predictions.length === 0) return null;

  // Scale opacity/size based on how close we are to the peak risk window (day 7-10 for most predictions)
  // dayOffset 1 = just starting, 14 = furthest projection
  const timeScale = dayOffset <= 7
    ? 0.4 + (dayOffset / 7) * 0.6    // ramps up to 1.0 at day 7
    : 1.0 - ((dayOffset - 7) / 7) * 0.35; // slowly fades after day 7

  return predictions.map((p, i) => {
    const color = riskColors[p.risk_level] || "#ffcc00";
    const fill = riskGlow[p.risk_level] || "rgba(255,204,0,0.1)";
    const baseOuter = p.risk_level === "CRITICAL" ? 70000 : p.risk_level === "HIGH" ? 50000 : 35000;
    const outerRadius = Math.round(baseOuter * (0.7 + timeScale * 0.3));
    const baseMarkerR = p.risk_level === "CRITICAL" ? 14 : p.risk_level === "HIGH" ? 11 : 9;
    const markerRadius = Math.max(5, Math.round(baseMarkerR * timeScale));

    return (
      <React.Fragment key={`pred-${i}`}>
        {/* Outer glow ring */}
        <Circle
          center={[p.lat, p.lon]}
          radius={outerRadius}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: Math.min(0.12, 0.06 * timeScale * 2),
            weight: 1.5,
            opacity: Math.min(0.8, 0.5 * timeScale * 1.5),
            dashArray: "8 6",
          }}
        />
        {/* Inner core marker */}
        <CircleMarker
          center={[p.lat, p.lon]}
          radius={markerRadius}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: Math.min(0.9, 0.75 * timeScale * 1.2),
            weight: 2.5,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>⚠ {p.region} — {p.risk_level} RISK</span>
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 220, maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <strong style={{ color: "#fff", fontSize: 13 }}>{p.region}</strong>
                  <div style={{ color: "#94a3b8", fontSize: 10 }}>{p.province}</div>
                </div>
              </div>
              <div style={{
                display: "inline-block",
                background: color + "33",
                border: `1px solid ${color}66`,
                color,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8
              }}>
                {p.risk_level} RISK · Score: {p.risk_score}/100
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
                {p.explanation}
              </p>
              {p.risk_factors && p.risk_factors.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {p.risk_factors.map((f, j) => (
                    <span key={j} style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#94a3b8",
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontSize: 10
                    }}>{f}</span>
                  ))}
                </div>
              )}
              <div style={{ color: "#475569", fontSize: 9, marginTop: 8, borderTop: "1px solid #334155", paddingTop: 4 }}>
                AI Prediction · Based on satellite + weather data
              </div>
            </div>
          </Popup>
        </CircleMarker>
      </React.Fragment>
    );
  });
}