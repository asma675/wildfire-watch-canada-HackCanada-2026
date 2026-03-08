import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, MapPin, Phone, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AlertSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    sms_enabled: false,
    email_enabled: true,
    advisory_enabled: true,
    warning_enabled: true,
    evacuation_enabled: true
  });
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ label: '', latitude: '', longitude: '', alert_radius_km: 50 });

  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
    })();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: () => user?.email ? base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]) : null,
    enabled: !!user?.email
  });

  const { data: prefs } = useQuery({
    queryKey: ['notificationPrefs', user?.email],
    queryFn: () => user?.email ? base44.entities.NotificationPreferences.filter({ user_email: user.email }).then(r => r[0]) : null,
    enabled: !!user?.email
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['savedLocations', user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : [],
    enabled: !!user?.email
  });

  useEffect(() => {
    if (profile) setFormData(prev => ({ ...prev, full_name: profile.full_name || '', phone_number: profile.phone_number || '' }));
    if (prefs) {
      setFormData(prev => ({
        ...prev,
        sms_enabled: prefs.sms_enabled || false,
        email_enabled: prefs.email_enabled !== false,
        advisory_enabled: prefs.advisory_enabled !== false,
        warning_enabled: prefs.warning_enabled !== false,
        evacuation_enabled: prefs.evacuation_enabled !== false
      }));
    }
  }, [profile, prefs]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          full_name: formData.full_name,
          phone_number: formData.phone_number
        });
      } else {
        await base44.entities.UserProfile.create({
          user_email: user.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          phone_verified: false
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async () => {
      if (prefs) {
        await base44.entities.NotificationPreferences.update(prefs.id, {
          sms_enabled: formData.sms_enabled,
          email_enabled: formData.email_enabled,
          advisory_enabled: formData.advisory_enabled,
          warning_enabled: formData.warning_enabled,
          evacuation_enabled: formData.evacuation_enabled
        });
      } else {
        await base44.entities.NotificationPreferences.create({
          user_email: user.email,
          sms_enabled: formData.sms_enabled,
          email_enabled: formData.email_enabled,
          advisory_enabled: formData.advisory_enabled,
          warning_enabled: formData.warning_enabled,
          evacuation_enabled: formData.evacuation_enabled
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificationPrefs'] });
    }
  });

  const addLocationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SavedLocation.create({
        user_email: user.email,
        label: newLocation.label,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude),
        alert_radius_km: parseFloat(newLocation.alert_radius_km || 50),
        is_primary: locations.length === 0
      });
    },
    onSuccess: () => {
      setNewLocation({ label: '', latitude: '', longitude: '', alert_radius_km: 50 });
      setShowAddLocation(false);
      qc.invalidateQueries({ queryKey: ['savedLocations'] });
    }
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedLocation.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savedLocations'] });
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (locId) => {
      // Reset all to false, then set this one to true
      await Promise.all(locations.map(loc => 
        base44.entities.SavedLocation.update(loc.id, { is_primary: loc.id === locId })
      ));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savedLocations'] });
    }
  });

  const handleSave = async () => {
    await updateProfileMutation.mutateAsync();
    await updatePrefsMutation.mutateAsync();
  };

  if (!user) return <div className="p-6 text-slate-400">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Alert Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage notifications and saved locations</p>
      </div>

      {/* Contact Info */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Phone className="w-5 h-5" /> Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-slate-500 opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number (for SMS)</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Preferences</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, email_enabled: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Receive email alerts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sms_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, sms_enabled: e.target.checked }))}
              className="w-4 h-4 rounded"
              disabled
            />
            <span className="text-sm text-slate-500">(SMS disabled)</span>
          </label>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Alert Severity Levels</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.advisory_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, advisory_enabled: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Advisory - Monitor conditions</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.warning_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, warning_enabled: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Warning - Prepare to evacuate</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.evacuation_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, evacuation_enabled: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-300">Evacuation - Immediate danger</span>
          </label>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending || updatePrefsMutation.isPending}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-4"
        >
          Save Preferences
        </Button>
      </Card>

      {/* Saved Locations */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><MapPin className="w-5 h-5" /> Saved Locations</h2>
          <Button
            onClick={() => setShowAddLocation(!showAddLocation)}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1"
          >
            <Plus className="w-4 h-4" /> Add Location
          </Button>
        </div>

        {showAddLocation && (
          <div className="border border-white/10 rounded-lg p-4 space-y-3 bg-[#0f0f1a]">
            <input
              type="text"
              placeholder="Label (e.g. Home, Work, Cottage)"
              value={newLocation.label}
              onChange={(e) => setNewLocation(prev => ({ ...prev, label: e.target.value }))}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={newLocation.latitude}
                onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={newLocation.longitude}
                onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <input
              type="number"
              min="1"
              max="500"
              placeholder="Alert radius (km)"
              value={newLocation.alert_radius_km}
              onChange={(e) => setNewLocation(prev => ({ ...prev, alert_radius_km: e.target.value }))}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => addLocationMutation.mutate()}
                disabled={!newLocation.label || !newLocation.latitude || !newLocation.longitude || addLocationMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Add
              </Button>
              <Button
                onClick={() => setShowAddLocation(false)}
                variant="outline"
                className="flex-1 border-white/10 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-3 border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm flex items-center gap-2">
                  {loc.is_primary && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  {loc.label}
                </p>
                <p className="text-xs text-slate-500">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)} • {loc.alert_radius_km}km radius</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {!loc.is_primary && (
                  <Button
                    onClick={() => setPrimaryMutation.mutate(loc.id)}
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-xs"
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  onClick={() => deleteLocationMutation.mutate(loc.id)}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
              No saved locations yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}