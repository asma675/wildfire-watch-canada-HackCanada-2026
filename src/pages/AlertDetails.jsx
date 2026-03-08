import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Flame, Phone, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const severityColors = {
  advisory: "bg-green-500/10 border-green-500/30 text-green-400",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  evacuation: "bg-red-500/10 border-red-500/30 text-red-400"
};

export default function AlertDetails() {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEventId(params.get("eventId"));
  }, []);

  const { data: event, isLoading } = useQuery({
    queryKey: ["wildfireEvent", eventId],
    queryFn: () => eventId ? base44.entities.WildfireEvent.filter({ id: eventId }) : null,
    enabled: !!eventId
  });

  const evt = event?.[0];

  if (!eventId || isLoading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  if (!evt) {
    return <div className="p-6 text-slate-400">Event not found</div>;
  }

  const severityColor = severityColors[evt.severity] || severityColors.advisory;
  const isCritical = evt.severity === "evacuation";

  return (
    <div className={`min-h-screen ${isCritical ? "bg-red-500/5" : "bg-slate-900"}`}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Header */}
        <div className={`rounded-2xl border p-6 ${severityColor}`}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-white/10 flex-shrink-0">
              {isCritical ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <Flame className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{evt.title}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 border border-white/20">
                  {evt.severity}
                </span>
              </div>
              <p className="opacity-75 text-sm">
                Detected {new Date(evt.detected_at).toLocaleDateString()} at {new Date(evt.detected_at).toLocaleTimeString()}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {evt.source || "Unknown source"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Risks */}
        {evt.health_risk_text && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Health Concerns
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{evt.health_risk_text}</p>
          </div>
        )}

        {/* Evacuation Guidance */}
        {evt.evacuation_text && (
          <div className={`rounded-2xl border p-6 ${evt.severity === "evacuation" ? "border-red-500/30 bg-red-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
            <h2 className={`font-semibold mb-3 flex items-center gap-2 ${evt.severity === "evacuation" ? "text-red-400" : "text-orange-400"}`}>
              <AlertTriangle className="w-4 h-4" />
              {evt.severity === "evacuation" ? "Evacuation Order" : "Evacuation Guidance"}
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{evt.evacuation_text}</p>
          </div>
        )}

        {/* General Guidance */}
        {evt.guidance_text && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <h2 className="font-semibold text-blue-400 mb-3">Safety Instructions</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{evt.guidance_text}</p>
          </div>
        )}

        {/* Emergency Resources */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="font-semibold text-white">Emergency Resources</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button className="gap-2 bg-red-600 hover:bg-red-700">
              <Phone className="w-4 h-4" /> Call 911 (Emergency)
            </Button>
            <Button variant="outline" className="border-white/10">
              Find Evacuation Centers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}