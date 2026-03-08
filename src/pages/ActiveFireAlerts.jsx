import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Flame, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const severityColors = {
  advisory: "border-green-500/30 bg-green-500/5 text-green-400",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  evacuation: "border-red-500/30 bg-red-500/5 text-red-400"
};

const severityIcons = {
  advisory: "w-4 h-4 text-green-400",
  warning: "w-4 h-4 text-yellow-400",
  evacuation: "w-4 h-4 text-red-400"
};

export default function ActiveFireAlerts() {
  const [user, setUser] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const { data: locations = [] } = useQuery({
    queryKey: ["savedLocations", user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : null,
    enabled: !!user?.email
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["wildfireEvents"],
    queryFn: () => base44.entities.WildfireEvent.filter({ status: "active" }),
    refetchInterval: 60 * 1000
  });

  // Calculate nearby alerts
  React.useEffect(() => {
    if (!locations.length || !events.length) {
      setNearbyAlerts([]);
      return;
    }

    const nearby = [];
    events.forEach(event => {
      locations.forEach(loc => {
        const distance = haversineDistance(loc.latitude, loc.longitude, event.latitude, event.longitude);
        if (distance <= loc.alert_radius_km) {
          nearby.push({ ...event, location: loc, distance: Math.round(distance) });
        }
      });
    });
    setNearbyAlerts(nearby.sort((a, b) => a.distance - b.distance));
  }, [locations, events]);

  if (!user) {
    return <div className="p-6 text-slate-400">Please log in to view active alerts</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Active Fire Alerts</h1>
          <p className="text-slate-400">Wildfires near your saved locations</p>
        </div>
        <Link to={createPageUrl("AlertSettings")}>
          <Button variant="outline" className="border-white/10">Settings</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : nearbyAlerts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
          <Flame className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No active fire alerts near your locations</p>
          <p className="text-sm text-slate-600 mt-2">Add saved locations to receive alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nearbyAlerts.map((alert, idx) => (
            <Link key={idx} to={createPageUrl(`AlertDetails?eventId=${alert.id}`)}>
              <div className={`p-4 rounded-2xl border flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer ${severityColors[alert.severity]}`}>
                <div className={`p-3 rounded-lg bg-white/5 flex-shrink-0 ${severityColors[alert.severity].split(" ")[2]}`}>
                  {alert.severity === "evacuation" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Flame className={severityIcons[alert.severity]} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-white">{alert.title}</h3>
                      <p className="text-xs opacity-75 capitalize mt-0.5">{alert.severity} • {alert.distance}km away</p>
                    </div>
                    <span className="text-xs font-semibold uppercase opacity-75 flex-shrink-0">{alert.severity}</span>
                  </div>
                  <p className="text-xs opacity-75">Near {alert.location.label}</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-50 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}