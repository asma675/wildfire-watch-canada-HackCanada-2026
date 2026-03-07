import L from "leaflet";

// Creates a glowing fire hotspot DivIcon matching the ESRI/CWFIS aesthetic
// — bright neon amber/orange outline with shiny radial fill, like molten lava perimeters
export function createFlameIcon(soc, hectares) {
  const size = hectares > 50000 ? 44 : hectares > 10000 ? 34 : hectares > 1000 ? 26 : hectares > 100 ? 20 : 14;

  const configs = {
    OC: { bright: "#fff5a0", mid: "#ffb300", outer: "#ff4500", glow: "#ff6600", glowSize: 12 },
    BH: { bright: "#fff0a0", mid: "#ffcc00", outer: "#ff7700", glow: "#ff9900", glowSize: 8 },
    UC: { bright: "#ffee99", mid: "#ffd700", outer: "#ffaa00", glow: "#ffbb00", glowSize: 6 },
    EX: { bright: "#ccc", mid: "#999", outer: "#666", glow: "#888", glowSize: 2 },
    Prescribed: { bright: "#e9d5ff", mid: "#c084fc", outer: "#7c3aed", glow: "#9333ea", glowSize: 6 },
  };

  const c = configs[soc] || configs["UC"];
  const uid = `fg_${soc}_${size}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
    <defs>
      <radialGradient id="${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${c.bright}" stop-opacity="1"/>
        <stop offset="35%"  stop-color="${c.mid}"    stop-opacity="0.95"/>
        <stop offset="70%"  stop-color="${c.outer}"  stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${c.outer}"  stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="19" fill="url(#${uid})"/>
    <circle cx="20" cy="20" r="19" fill="none" stroke="${c.mid}" stroke-width="1.5" stroke-opacity="0.9"/>
    <circle cx="20" cy="20" r="10" fill="${c.bright}" fill-opacity="0.6"/>
  </svg>`;

  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 0 ${c.glowSize}px ${c.glow}) drop-shadow(0 0 ${c.glowSize * 2}px ${c.outer});">${svg}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}