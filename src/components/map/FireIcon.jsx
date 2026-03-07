import L from "leaflet";

// Creates a realistic animated flame icon using SVG DivIcon
export function createFlameIcon(soc, hectares) {
  // Size based on fire area
  const size = hectares > 50000 ? 36 : hectares > 5000 ? 28 : hectares > 100 ? 22 : 16;

  // Color gradients per status
  const gradients = {
    OC: { outer: "#ff2200", inner: "#ff6600", core: "#ffcc00" },   // Out of Control - intense red
    BH: { outer: "#ff6600", inner: "#ff9900", core: "#ffdd00" },   // Being Held - orange
    UC: { outer: "#ffaa00", inner: "#ffd000", core: "#fff200" },   // Under Control - amber
    EX: { outer: "#888", inner: "#aaa", core: "#ccc" },            // Extinguished - grey
    Prescribed: { outer: "#9333ea", inner: "#c084fc", core: "#e9d5ff" }, // Prescribed - purple
  };

  const g = gradients[soc] || gradients["UC"];
  const pulse = soc === "OC" ? "fire-pulse" : soc === "BH" ? "fire-pulse-slow" : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 40" class="${pulse}">
      <defs>
        <radialGradient id="glow-${soc}" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="${g.core}" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="${g.outer}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- glow base -->
      <ellipse cx="16" cy="36" rx="10" ry="5" fill="url(#glow-${soc})" opacity="0.7"/>
      <!-- outer flame -->
      <path d="M16 2 C10 8 4 14 6 22 C7 27 10 30 16 32 C22 30 25 27 26 22 C28 14 22 8 16 2Z" 
            fill="${g.outer}" opacity="0.9"/>
      <!-- mid flame -->
      <path d="M16 8 C12 13 9 18 11 23 C12 26 14 28 16 29 C18 28 20 26 21 23 C23 18 20 13 16 8Z" 
            fill="${g.inner}" opacity="0.95"/>
      <!-- core -->
      <path d="M16 16 C14 19 13 22 14 24 C14.5 25.5 15.2 26.5 16 27 C16.8 26.5 17.5 25.5 18 24 C19 22 18 19 16 16Z" 
            fill="${g.core}"/>
    </svg>`;

  return L.divIcon({
    html: `<div style="filter: drop-shadow(0 0 ${soc === "OC" ? 6 : 3}px ${g.outer})">${svg}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}