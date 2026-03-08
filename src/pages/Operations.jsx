// Fetch MonitoredZone entities and remove duplicates
async function fetchMonitoredZoneEntities() {
  try {
    const response = await fetch(`/api/apps/69abd0aca9b6f6b19517dd6d/entities/MonitoredZone`, {
      headers: {
        api_key: '83c5cdff8ef34c99bed982b534594ee9',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.status}`);
    }

    const data = await response.json();

    // Adjust this depending on your API response shape
    const zones = Array.isArray(data) ? data : data.results || [];

    // Remove duplicates using name + province
    const uniqueZones = Array.from(
      new Map(
        zones.map((zone) => [
          `${zone.name?.trim().toLowerCase()}-${zone.province?.trim().toLowerCase()}`,
          zone,
        ])
      ).values()
    );

    console.log('Unique zones:', uniqueZones);
    return uniqueZones;
  } catch (error) {
    console.error('Error fetching monitored zones:', error);
    return [];
  }
}