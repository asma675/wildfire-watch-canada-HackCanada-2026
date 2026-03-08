import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ZoneCard from "@/components/dashboard/ZoneCard";
import ThreatBadge from "@/components/dashboard/ThreatBadge";
import ZoneForm from "@/components/zones/ZoneForm";
import {
  Plus, Zap, Loader2, Trash2, Pencil, Shield, MapPin,
  Clock
} from "lucide-react";
import moment from "moment";

export default function ZonesContent() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);
  const qc = useQueryClient();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["monitoredZones"],
    queryFn: async () => {
      const result = await base44.entities.MonitoredZone.list("-risk_score", 50);
      return Array.isArray(result) ? result : [];
    },
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.MonitoredZone.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["zones"] }); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MonitoredZone.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["zones"] }); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.MonitoredZone.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["zones"] }); setSelected(null); },
  });

  const analyzeZone = async (zone) => {
    setAnalyzing(zone.id);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a wildfire risk analyst. Analyze this Canadian zone for wildfire risk:
Zone: ${zone.name}, Province: ${zone.province}
Coordinates: ${zone.latitude}°N, ${zone.longitude}°W
Current conditions: Temp ${zone.weather_temp_c || "unknown"}°C, Humidity ${zone.weather_humidity || "unknown"}%, Wind ${zone.weather_wind_kmh || "unknown"} km/h

Provide real current data for this area. Consider weather, vegetation dryness, historical fires, and terrain.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number", description: "0-100" },
            threat_level: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "EXTREME"] },
            weather_temp_c: { type: "number" },
            weather_humidity: { type: "number" },
            weather_wind_kmh: { type: "number" },
            ndvi_score: { type: "number", description: "0-1 vegetation health" },
            analysis_summary: { type: "string" },
            recommendations: { type: "string" },
            historical_fire_context: { type: "string" },
          },
        },
      });
      await base44.entities.MonitoredZone.update(zone.id, {
        ...res,
        last_analysis: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ["zones"] });
    } catch (e) {
      console.error(e);
    }
    setAnalyzing(null);
  };

  const handleSave = async (data) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data });
    } else {
      await createMut.mutateAsync(data);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{zones.length} zones being monitored</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); }} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add Zone
        </Button>
      </div>

      {(showForm || editing) && (
        <ZoneForm zone={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)
          ) : zones.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No zones yet. Add your first monitoring zone.</p>
            </div>
          ) : (
            zones.map((zone) => (
              <div key={zone.id} className="group relative">
                <ZoneCard zone={zone} onClick={() => setSelected(zone)} />
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); analyzeZone(zone); }}
                    disabled={analyzing === zone.id}
                    className="h-7 px-2 text-amber-400 hover:bg-amber-500/10"
                  >
                    {analyzing === zone.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditing(zone); setShowForm(false); }} className="h-7 px-2 text-slate-400 hover:bg-white/10">
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(zone.id); }} className="h-7 px-2 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          {selected ? (
            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-5 space-y-4 sticky top-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selected.province}
                  </p>
                </div>
                <ThreatBadge level={selected.threat_level} />
              </div>

              {selected.analysis_summary && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Analysis Summary</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.analysis_summary}</p>
                </div>
              )}

              {selected.recommendations && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
                  <h4 className="text-xs font-semibold text-amber-400 mb-1">Recommendations</h4>
                  <p className="text-sm text-amber-200/80 leading-relaxed">{selected.recommendations}</p>
                </div>
              )}

              {selected.last_analysis && (
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last analyzed: {moment(selected.last_analysis).fromNow()}
                </p>
              )}

              <Button onClick={() => analyzeZone(selected)} disabled={analyzing === selected.id} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
                {analyzing === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {analyzing === selected.id ? "Analyzing..." : "Run AI Analysis"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a zone to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}