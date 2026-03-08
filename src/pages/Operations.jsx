// Fetch zones and remove duplicates
async function fetchMonitoredZoneEntities() {
  try {
    const response = await fetch(`/api/apps/69abd0aca9b6f6b19517dd6d/entities/MonitoredZone`, {
      headers: {
        api_key: '83c5cdff8ef34c99bed982b534594ee9',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.status}`);
    }

    const data = await response.json();

    const zones = Array.isArray(data) ? data : data.results || [];

    // Remove duplicate zones
    const uniqueZones = Array.from(
      new Map(
        zones.map(zone => [
          `${zone.name}-${zone.province}`,
          zone
        ])
      ).values()
    );

    return uniqueZones;

  } catch (error) {
    console.error("Error fetching zones:", error);
    return [];
  }
}


// Render zones on the page
async function renderMonitoringZones() {

  const container = document.getElementById("monitoring-zones");

  if (!container) return;

  const zones = await fetchMonitoredZoneEntities();

  container.innerHTML = "";

  zones.forEach(zone => {

    const button = document.createElement("button");

    button.className = "zone-button";
    button.innerText = zone.name;

    button.onclick = () => {
      console.log("Selected zone:", zone.name);
    };

    container.appendChild(button);
  });
}


// Load zones when page opens
document.addEventListener("DOMContentLoaded", () => {
  renderMonitoringZones();
});