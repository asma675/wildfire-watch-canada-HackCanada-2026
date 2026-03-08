import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, X } from "lucide-react";

export default function EvacuationBanner() {
  const [user, setUser] = useState(null);
  const [evacuationAlerts, setEvacuationAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkAlerts = async () => {
      try {
        const locations = await base44.entities.SavedLocation.filter({ user_email: user.email });
        const activeEvents = await base44.entities.WildfireEvent.filter({ status: 'active', severity: 'evacuation' });

        function haversineDistance(lat1, lon1, lat2, lon2) {
          const R = 6371;
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
          return R * 2 * Math.asin(Math.sqrt(a));
        }

        const nearbyEvacuations = [];
        locations.forEach(loc => {
          activeEvents.forEach(event => {
            const distance = haversineDistance(loc.latitude, loc.longitude, event.latitude, event.longitude);
            if (distance <= (loc.alert_radius_km || 50)) {
              nearbyEvacuations.push(event);
            }
          });
        });

        setEvacuationAlerts(nearbyEvacuations);
      } catch (error) {
        console.error('Error checking evacuation alerts:', error);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  if (!user || evacuationAlerts.length === 0 || dismissed) return null;

  return (
    <div className="fixed top-14 lg:top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Flame className="w-6 h-6 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-sm">EVACUATION ORDER ACTIVE</p>
            <p className="text-xs opacity-90">
              {evacuationAlerts.length} evacuation-level alert{evacuationAlerts.length > 1 ? 's' : ''} near your saved location
              {evacuationAlerts.length > 1 ? 's' : ''}. Evacuate immediately.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-2 hover:bg-red-500/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}