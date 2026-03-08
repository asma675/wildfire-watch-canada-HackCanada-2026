import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Shield, Flame, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmergencyAlertDetails() {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setEventId(urlParams.get('id'));
  }, []);

  const { data: event } = useQuery({
    queryKey: ['wildfireEvent', eventId],
    queryFn: () => eventId ? base44.entities.WildfireEvent.get(eventId) : null,
    enabled: !!eventId
  });

  if (!event) return <div className="p-6 text-slate-400">Loading...</div>;

  const severityConfig = {
    advisory: { color: 'blue', icon: Shield, title: 'Advisory' },
    warning: { color: 'orange', icon: AlertTriangle, title: 'Warning' },
    evacuation: { color: 'red', icon: Flame, title: 'Evacuation' }
  };

  const config = severityConfig[event.severity] || severityConfig.advisory;
  const Icon = config.icon;
  const colorClass = config.color === 'red' ? 'red' : config.color === 'orange' ? 'orange' : 'blue';

  const colorMap = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', header: 'from-red-500 to-red-600' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', header: 'from-orange-500 to-orange-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', header: 'from-blue-500 to-blue-600' }
  };

  const colors = colorMap[colorClass];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Link to={createPageUrl('ActiveFireAlerts')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="w-4 h-4" /> Back to Alerts
      </Link>

      {/* Header Alert */}
      <div className={`rounded-2xl bg-gradient-to-r ${colors.header} p-8 text-white space-y-3`}>
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
        <div className="text-sm opacity-90 space-y-1">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Latitude: {event.latitude.toFixed(4)}, Longitude: {event.longitude.toFixed(4)}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Detected: {new Date(event.detected_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status */}
      <Card className={`bg-[#1a1a2e] border ${colors.border} p-6`}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Severity</p>
            <p className={`text-lg font-bold ${colors.text} uppercase`}>{event.severity}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Status</p>
            <p className="text-lg font-bold text-white capitalize">{event.status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Source</p>
            <p className="text-lg font-bold text-white">{event.source || 'System'}</p>
          </div>
        </div>
      </Card>

      {/* Health Risks */}
      {event.health_risk_text && (
        <Card className="bg-yellow-500/10 border border-yellow-500/30 p-6">
          <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Health Risks
          </h2>
          <p className="text-yellow-100 text-sm leading-relaxed">{event.health_risk_text}</p>
        </Card>
      )}

      {/* Guidance */}
      {event.guidance_text && (
        <Card className="bg-blue-500/10 border border-blue-500/30 p-6">
          <h2 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Guidance
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">{event.guidance_text}</p>
        </Card>
      )}

      {/* Evacuation Instructions */}
      {event.evacuation_text && (
        <Card className="bg-red-500/10 border border-red-500/30 p-6">
          <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Evacuation Instructions
          </h2>
          <p className="text-red-100 text-sm leading-relaxed whitespace-pre-wrap">{event.evacuation_text}</p>
        </Card>
      )}

      {/* Emergency Resources */}
      <Card className="bg-[#1a1a2e] border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Emergency Resources</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
            Call Emergency Services (911)
          </Button>
          <Button variant="outline" className="w-full border-white/10 text-slate-300">
            Contact Local Fire Department
          </Button>
          <Button variant="outline" className="w-full border-white/10 text-slate-300">
            Visit Emergency Alert Portal
          </Button>
        </div>
      </Card>
    </div>
  );
}