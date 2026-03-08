import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Flame, Shield, MapPin, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmergencyAlertDetails() {
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEventId(params.get('id'));
  }, []);

  const { data: event } = useQuery({
    queryKey: ['wildfireEvent', eventId],
    queryFn: () => eventId ? base44.entities.WildfireEvent.filter({ id: eventId }).then(r => r[0]) : null,
    enabled: !!eventId
  });

  if (!event) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <Link to={createPageUrl("ActiveFireAlerts")}>
          <Button variant="outline" className="gap-2 border-white/10 text-slate-300 hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Back to Alerts
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-slate-400">Loading alert details...</p>
        </div>
      </div>
    );
  }

  const severityConfig = {
    advisory: {
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      icon: Shield
    },
    warning: {
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      icon: AlertTriangle
    },
    evacuation: {
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      icon: Flame
    }
  };

  const config = severityConfig[event.severity] || severityConfig.advisory;
  const Icon = config.icon;

  const evacuationSteps = [
    { title: "Prepare Your Home", items: ["Close all windows and doors", "Turn off gas at the meter/tank", "Leave exterior lights on", "Close interior doors to slow fire spread"] },
    { title: "Grab Essential Items", items: ["Important documents (birth certificates, deeds, etc.)", "Medications and medical equipment", "Phone chargers and portable batteries", "Irreplaceable family photos/heirlooms", "Laptop and external hard drives", "Pet carriers and supplies"] },
    { title: "Evacuation Checklist", items: ["Turn off lights and close windows", "Lock all doors", "Take your pre-packed emergency kit", "Drive with headlights on", "Use main roads only", "Do NOT use shortcuts", "Follow police and fire personnel directions"] },
    { title: "During Evacuation", items: ["Do not return for belongings", "Stay informed via local news/alerts", "Keep fuel tank at least half full", "Bring pets in carriers", "Have your vehicle facing the correct direction for quick exit", "Avoid congested areas"] },
    { title: "Health & Safety", items: ["Use N95/P100 masks in smoky areas", "Stay hydrated", "Monitor for smoke inhalation symptoms", "Keep a supply of fresh water", "Charge phones and portable chargers", "Have cash available - ATMs may not work"] }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <Link to={createPageUrl("ActiveFireAlerts")}>
        <Button variant="outline" className="gap-2 border-white/10 text-slate-300 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" /> Back to Alerts
        </Button>
      </Link>

      {/* Alert Header */}
      <div className={`rounded-2xl border p-8 ${config.borderColor} ${config.bgColor}`}>
        <div className="flex items-start gap-6">
          <div className={`p-4 rounded-xl flex-shrink-0 ${config.bgColor}`}>
            <Icon className={`w-8 h-8 ${config.textColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} uppercase`}>
                {event.severity}
              </span>
            </div>
            <p className="text-slate-400 text-lg mb-4">{event.guidance_text}</p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Latitude: {event.latitude.toFixed(4)}, Longitude: {event.longitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Detected: {new Date(event.detected_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Risk Information */}
      {event.health_risk_text && (
        <Card className="bg-[#1a1a2e] border-yellow-500/30 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Health Risks
          </h2>
          <p className="text-slate-300 leading-relaxed">{event.health_risk_text}</p>
        </Card>
      )}

      {/* Evacuation Guidance */}
      {event.severity === 'evacuation' && event.evacuation_text && (
        <Card className="bg-[#1a1a2e] border-red-500/30 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Immediate Evacuation Required
          </h2>
          <p className="text-slate-300 leading-relaxed font-semibold">{event.evacuation_text}</p>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-4">
            <p className="text-red-300 text-sm">
              ⚠️ <strong>DO NOT WAIT FOR OFFICIAL EVACUATION ORDER</strong> - Leave immediately if you feel unsafe.
            </p>
          </div>
        </Card>
      )}

      {/* Evacuation Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Essential Actions</h2>
        <div className="grid gap-6">
          {evacuationSteps.map((section, idx) => (
            <Card key={idx} className="bg-[#1a1a2e] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="text-amber-400 font-bold mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Resources */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Important Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-slate-200 mb-1">Emergency Services</p>
            <p>Call 911 for immediate emergencies</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200 mb-1">Local Alerts</p>
            <p>Check your provincial emergency alert system for updates</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200 mb-1">Air Quality</p>
            <p>Monitor air quality index for health impacts</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200 mb-1">Pet Safety</p>
            <p>Arrange pet-friendly shelter before evacuation</p>
          </div>
        </div>
      </Card>
    </div>
  );
}