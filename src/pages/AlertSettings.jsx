import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, MapPin } from "lucide-react";

export default function AlertSettings() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newLocationLabel, setNewLocationLabel] = useState("");
  const [newLocationLat, setNewLocationLat] = useState("");
  const [newLocationLng, setNewLocationLng] = useState("");
  const [newLocationRadius, setNewLocationRadius] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: () => user?.email ? base44.entities.UserProfile.filter({ user_email: user.email }) : null,
    enabled: !!user?.email
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ["notificationPrefs", user?.email],
    queryFn: () => user?.email ? base44.entities.NotificationPreferences.filter({ user_email: user.email }) : null,
    enabled: !!user?.email
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["savedLocations", user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : null,
    enabled: !!user?.email
  });

  const pref = prefs[0];

  const updatePrefMutation = useMutation({
    mutationFn: (data) => pref ? base44.entities.NotificationPreferences.update(pref.id, data) : base44.entities.NotificationPreferences.create({ user_email: user.email, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificationPrefs"] })
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => profile?.[0]?.id ? base44.entities.UserProfile.update(profile[0].id, data) : base44.entities.UserProfile.create({ user_email: user.email, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] })
  });

  const addLocationMutation = useMutation({
    mutationFn: () => base44.entities.SavedLocation.create({
      user_email: user.email,
      label: newLocationLabel,
      latitude: parseFloat(newLocationLat),
      longitude: parseFloat(newLocationLng),
      alert_radius_km: newLocationRadius,
      is_primary: locations.length === 0
    }),
    onSuccess: () => {
      setNewLocationLabel("");
      setNewLocationLat("");
      setNewLocationLng("");
      setNewLocationRadius(50);
      qc.invalidateQueries({ queryKey: ["savedLocations"] });
    }
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedLocation.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedLocations"] })
  });

  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-slate-400">Please log in to manage alert settings</div>;
  }

  const userProfile = profile?.[0];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Alert Settings</h1>
        <p className="text-slate-400">Configure how you receive wildfire alerts</p>
      </div>

      {/* Contact Info */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Contact Information</h2>
        <div>
          <label className="text-sm text-slate-300">Phone Number (for SMS alerts)</label>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber || userProfile?.phone_number || ""}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-2"
          />
          <Button
            onClick={() => updateProfileMutation.mutate({ phone_number: phoneNumber })}
            disabled={updateProfileMutation.isPending}
            className="mt-2"
          >
            {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Phone
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Notification Channels</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Email Alerts</p>
              <p className="text-xs text-slate-500">Receive alerts via email</p>
            </div>
            <Switch
              checked={pref?.email_enabled ?? true}
              onCheckedChange={(v) => updatePrefMutation.mutate({ email_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">SMS Alerts</p>
              <p className="text-xs text-slate-500">Receive alerts via text message</p>
            </div>
            <Switch
              checked={pref?.sms_enabled ?? false}
              onCheckedChange={(v) => updatePrefMutation.mutate({ sms_enabled: v })}
              disabled={!phoneNumber && !userProfile?.phone_number}
            />
          </div>
        </div>
      </div>

      {/* Alert Levels */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Alert Types</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5">
            <div>
              <p className="text-sm font-medium text-white">Advisory</p>
              <p className="text-xs text-slate-500">Potential fire activity detected</p>
            </div>
            <Switch
              checked={pref?.advisory_enabled ?? true}
              onCheckedChange={(v) => updatePrefMutation.mutate({ advisory_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <div>
              <p className="text-sm font-medium text-white">Warning</p>
              <p className="text-xs text-slate-500">Active fire threat nearby</p>
            </div>
            <Switch
              checked={pref?.warning_enabled ?? true}
              onCheckedChange={(v) => updatePrefMutation.mutate({ warning_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-sm font-medium text-white">Evacuation</p>
              <p className="text-xs text-slate-500">Evacuation order issued</p>
            </div>
            <Switch
              checked={pref?.evacuation_enabled ?? true}
              onCheckedChange={(v) => updatePrefMutation.mutate({ evacuation_enabled: v })}
            />
          </div>
        </div>
      </div>

      {/* Saved Locations */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Monitored Locations
        </h2>

        <div className="space-y-3">
          {locations.map((loc) => (
            <div key={loc.id} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] flex items-start justify-between">
              <div>
                <p className="font-medium text-white">{loc.label}</p>
                <p className="text-xs text-slate-500 mt-1">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                <p className="text-xs text-slate-500">Alert radius: {loc.alert_radius_km}km</p>
              </div>
              <Button
                onClick={() => deleteLocationMutation.mutate(loc.id)}
                disabled={deleteLocationMutation.isPending}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Location */}
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
          <p className="font-medium text-white text-sm">Add Location</p>
          <Input
            placeholder="e.g., Home, Work, Cottage"
            value={newLocationLabel}
            onChange={(e) => setNewLocationLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.0001"
              placeholder="Latitude"
              value={newLocationLat}
              onChange={(e) => setNewLocationLat(e.target.value)}
            />
            <Input
              type="number"
              step="0.0001"
              placeholder="Longitude"
              value={newLocationLng}
              onChange={(e) => setNewLocationLng(e.target.value)}
            />
          </div>
          <Input
            type="number"
            placeholder="Alert radius (km)"
            value={newLocationRadius}
            onChange={(e) => setNewLocationRadius(Number(e.target.value))}
          />
          <Button
            onClick={() => addLocationMutation.mutate()}
            disabled={!newLocationLabel || !newLocationLat || !newLocationLng || addLocationMutation.isPending}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {addLocationMutation.isPending ? "Adding..." : "Add Location"}
          </Button>
        </div>
      </div>
    </div>
  );
}