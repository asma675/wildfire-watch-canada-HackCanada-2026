import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, AlertTriangle, Flame, Shield, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export default function ActiveFireAlerts() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
    })();
  }, []);

  const { data: userLocations = [] } = useQuery({
    queryKey: ['savedLocations', user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : [],
    enabled: !!user?.email
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['wildfireEvents'],
    queryFn: () => base44.entities.WildfireEvent.filter({ status: 'active' }),
    refetchInterval: 60000
  });

  // Find events near saved locations
  const nearbyEvents = [];
  userLocations.forEach(loc => {
    allEvents.forEach(event => {
      const distance = haversineDistance(
        loc.latitude, loc.longitude,
        event.latitude, event.longitude
      );
      if (distance <= (loc.alert_radius_km || 50)) {
        nearbyEvents.push({
          ...event,
          distance: Math.round(distance),
          nearestLocation: loc.label
        });
      }
    });
  });

  const severityColors = {
    advisory: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300', icon: Shield },
    warning: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300', icon: AlertTriangle },
    evacuation: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300', icon: Flame }
  };

  if (!user) return <div className="p-6 text-slate-400">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Active Fire Alerts</h1>
        <p className="text-sm text-slate-400 mt-1">Wildfires near your saved locations</p>
      </div>

      {nearbyEvents.length === 0 ? (
        <div className="text-center py-16">
          <Flame className="w-12 h-12 mx-auto text-slate-500 mb-4 opacity-50" />
          <p className="text-slate-400 text-lg">No active wildfires near your saved locations</p>
          <p className="text-slate-500 text-sm mt-1">Stay safe and keep your locations updated</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {nearbyEvents.map((event) => {
            const colors = severityColors[event.severity];
            const Icon = colors.icon;
            return (
              <Link key={event.id} to={createPageUrl(`EmergencyAlertDetails?id=${event.id}`)}>
                <Card className={`bg-[#1a1a2e] border ${colors.border} p-5 hover:shadow-lg transition-all cursor-pointer`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-lg truncate">{event.title}</h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${colors.badge} uppercase`}>
                            {event.severity}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.distance}km from {event.nearestLocation}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Detected: {new Date(event.detected_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}