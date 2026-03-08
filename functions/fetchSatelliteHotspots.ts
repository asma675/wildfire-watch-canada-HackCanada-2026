import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const NASA_KEY = Deno.env.get("NASA_FIRMS_API_KEY");

// Canada bounding box: lat 41-84, lon -141 to -52
const CANADA_BBOX = "-141,41,-52,84";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // body remains empty object
    }
    const { source = "VIIRS_SNPP_NRT", days = 1 } = body;

    // NASA FIRMS CSV API
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_KEY}/${source}/${CANADA_BBOX}/${days}`;
    const res = await fetch(url, { headers: { "User-Agent": "WildfireWatchCanada/1.0" } });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `NASA FIRMS error ${res.status}: ${errText}` }, { status: 502 });
    }

    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return Response.json({ hotspots: [], count: 0, source });

    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const hotspots = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",");
      const row = {};
      header.forEach((h, idx) => { row[h] = (parts[idx] || "").trim(); });

      const lat = parseFloat(row["latitude"]);
      const lon = parseFloat(row["longitude"]);
      if (isNaN(lat) || isNaN(lon)) continue;

      // Confidence: VIIRS uses 'l'/'n'/'h', MODIS uses 0-100 number
      const rawConf = row["confidence"] || "";
      let confidence_pct;
      if (rawConf === "h") confidence_pct = 90;
      else if (rawConf === "n") confidence_pct = 65;
      else if (rawConf === "l") confidence_pct = 35;
      else confidence_pct = parseInt(rawConf) || 50;

      hotspots.push({
        lat,
        lon,
        brightness: parseFloat(row["bright_ti4"] || row["brightness"]) || null,
        frp: parseFloat(row["frp"]) || 0, // fire radiative power (MW)
        confidence: confidence_pct,
        confidence_raw: rawConf,
        acq_date: row["acq_date"] || "",
        acq_time: row["acq_time"] || "",
        satellite: row["satellite"] || source,
        daynight: row["daynight"] || "",
      });
    }

    return Response.json({
      hotspots,
      count: hotspots.length,
      source,
      days,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});