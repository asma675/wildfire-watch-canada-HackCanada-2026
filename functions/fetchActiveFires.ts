import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch real active fire data from CWFIS (Natural Resources Canada, open licence)
    const csvUrl = "https://cwfis.cfs.nrcan.gc.ca/downloads/activefires/activefires.csv";
    const res = await fetch(csvUrl, {
      headers: { "User-Agent": "WildfireWatchCanada/1.0" }
    });

    if (!res.ok) {
      return Response.json({ error: `CWFIS fetch failed: ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    const lines = text.trim().split("\n");
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());

    const fires = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",");
      const row = {};
      header.forEach((h, idx) => { row[h] = (parts[idx] || "").trim(); });

      const lat = parseFloat(row["lat"]);
      const lon = parseFloat(row["lon"]);
      if (isNaN(lat) || isNaN(lon)) continue;

      // Only include Canadian agencies (exclude conus = USA)
      const agency = (row["agency"] || "").toLowerCase();
      if (agency === "conus") continue;

      fires.push({
        agency: row["agency"] || "",
        firename: row["firename"] || "Unknown Fire",
        lat,
        lon,
        startdate: row["startdate"] || "",
        hectares: parseFloat(row["hectares"]) || 0,
        stage_of_control: row["stage_of_control"] || "",
        province: agencyToProvince(row["agency"] || ""),
      });
    }

    return Response.json({ fires, count: fires.length, source: "CWFIS / NRCan", updated: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function agencyToProvince(agency) {
  const map = {
    ab: "AB", bc: "BC", mb: "MB", nb: "NB", nl: "NL",
    ns: "NS", nt: "NT", nu: "NU", on: "ON", pe: "PE",
    qc: "QC", sk: "SK", yt: "YT", pc: "Parks Canada",
  };
  return map[agency.toLowerCase()] || agency.toUpperCase();
}