import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Bell, Mail, Phone, MapPin, AlertTriangle, Flame, Shield, Save, Loader2, Edit2, X, CheckCircle2
} from "lucide-react";

export default function PersonalAlerts() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone_number: "",
    email: "",
    sms_enabled: false,
    email_enabled: true,
    advisory_enabled: true,
    warning_enabled: true,
    evacuation_enabled: true,
  });
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
    })();
  }, []);

  const { data: preferences } = useQuery({
    queryKey: ["notificationPreferences", user?.email],
    queryFn: () => user?.email ? base44.entities.NotificationPreferences.filter({ user_email: user.email }).then(r => r[0]) : null,
    enabled: !!user?.email
  });

  const { data: savedLocations = [] } = useQuery({
    queryKey: ["savedLocations", user?.email],
    queryFn: () => user?.email ? base44.entities.SavedLocation.filter({ user_email: user.email }) : [],
    enabled: !!user?.email
  });

  const { data: nearbyEvents = [] } = useQuery({
    queryKey: ["nearbyEvents"],
    queryFn: async () => {
      if (!savedLocations.length) return [];
      const events = await base44.entities.WildfireEvent.filter({ status: "active" });
      
      const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
        return R * 2 * Math.asin(Math.sqrt(a));
      };

      const nearby = [];
      savedLocations.forEach(loc => {
        events.forEach(evt => {
          const distance = haversine(loc.latitude, loc.longitude, evt.latitude, evt.longitude);
          if (distance <= (loc.alert_radius_km || 50)) {
            nearby.push({ ...evt, distance: Math.round(distance), location: loc.label });
          }
        });
      });
      return nearby;
    },
    enabled: !!user?.email && savedLocations.length > 0,
    refetchInterval: 60000
  });

  const updateMut = useMutation({
    mutationFn: (data) => {
      if (preferences?.id) {
        return base44.entities.NotificationPreferences.update(preferences.id, data);
      } else {
        return base44.entities.NotificationPreferences.create({ user_email: user.email, ...data });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notificationPreferences"] });
      setEditing(false);
    }
  });

  useEffect(() => {
    if (user && preferences) {
      setForm({
        phone_number: user.phone_number || "",
        email: user.email || "",
        sms_enabled: preferences.sms_enabled || false,
        email_enabled: preferences.email_enabled !== false,
        advisory_enabled: preferences.advisory_enabled !== false,
        warning_enabled: preferences.warning_enabled !== false,
        evacuation_enabled: preferences.evacuation_enabled !== false,
      });
    } else if (user) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user, preferences]);

  const handleSave = async () => {
    await updateMut.mutateAsync({
      sms_enabled: form.sms_enabled,
      email_enabled: form.email_enabled,
      advisory_enabled: form.advisory_enabled,
      warning_enabled: form.warning_enabled,
      evacuation_enabled: form.evacuation_enabled,
    });
  };

  const severityConfig = {
    advisory: { icon: Shield, color: "blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
    warning: { icon: AlertTriangle, color: "orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
    evacuation: { icon: Flame, color: "red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" }
  };

  if (!user) return <div className="p-6 text-slate-400">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Personal Fire Alerts</h1>
        <p className="text-slate-400 mt-2">Get notified immediately if a wildfire is detected near your saved locations</p>
      </div>

      {/* Contact Information */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            Contact Information
          </h2>
          <Button
            onClick={() => setEditing(!editing)}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Email</Label>
              <Input
                value={form.email}
                disabled
                className="bg-white/5 border-white/10 text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">Email is linked to your account</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Phone Number</Label>
              <Input
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">SMS alerts will be sent to this number</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-white">Alert Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts via email</p>
                </div>
                <Switch
                  checked={form.email_enabled}
                  onCheckedChange={(v) => setForm({ ...form, email_enabled: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">SMS Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts via text message</p>
                </div>
                <Switch
                  checked={form.sms_enabled}
                  onCheckedChange={(v) => setForm({ ...form, sms_enabled: v })}
                />
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Alert Severity Levels</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white">Advisory</span>
                  </div>
                  <Switch
                    checked={form.advisory_enabled}
                    onCheckedChange={(v) => setForm({ ...form, advisory_enabled: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-white">Warning</span>
                  </div>
                  <Switch
                    checked={form.warning_enabled}
                    onCheckedChange={(v) => setForm({ ...form, warning_enabled: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-white">Evacuation</span>
                  </div>
                  <Switch
                    checked={form.evacuation_enabled}
                    onCheckedChange={(v) => setForm({ ...form, evacuation_enabled: v })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateMut.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
              >
                {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Email:</span>
              <span className="text-white font-medium">{form.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Phone:</span>
              <span className="text-white font-medium">{form.phone_number || "Not provided"}</span>
            </div>
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Email Alerts</span>
                <span className={form.email_enabled ? "text-green-400" : "text-slate-600"}>{form.email_enabled ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">SMS Alerts</span>
                <span className={form.sms_enabled ? "text-green-400" : "text-slate-600"}>{form.sms_enabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Active Threats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Active Threats Near You
        </h2>

        {nearbyEvents.length === 0 ? (
          <Card className="bg-[#1a1a2e] border-green-500/30 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">All Clear</p>
            <p className="text-slate-500 text-sm mt-1">No active wildfires detected near your saved locations</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {nearbyEvents.map((event) => {
              const config = severityConfig[event.severity];
              const Icon = config.icon;
              return (
                <Card key={event.id} className={`border ${config.borderColor} ${config.bgColor} p-5`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${config.bgColor} flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.bgColor} text-${config.color} uppercase`}>
                          {event.severity}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm text-slate-300">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          {event.distance}km from {event.location}
                        </p>
                        <p className="text-xs text-slate-500">
                          Detected: {new Date(event.detected_at).toLocaleString()}
                        </p>
                        {event.guidance_text && (
                          <p className="pt-1 text-slate-400">{event.guidance_text}</p>
                        )}
                      </div>

                      {/* Emergency Actions */}
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Immediate Actions:</p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>✓ Prepare evacuation kit with essentials</li>
                          <li>✓ Keep vehicle fueled and facing exit direction</li>
                          <li>✓ Monitor local news and emergency alerts</li>
                          <li>✓ Have important documents ready</li>
                          {event.severity === "evacuation" && <li className="text-red-400 font-semibold">⚠ EVACUATE IMMEDIATELY - Do not wait for orders</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Evacuation Supplies Guide */}
      <Card className="bg-[#1a1a2e] border-white/10 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          Emergency Evacuation Supplies
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white mb-2">Essential Documents:</p>
            <ul className="space-y-1 text-xs">
              <li>• Identification</li>
              <li>• Insurance policies</li>
              <li>• Bank account info</li>
              <li>• Medical records</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Critical Supplies:</p>
            <ul className="space-y-1 text-xs">
              <li>• Emergency blankets</li>
              <li>• Water & non-perishable food</li>
              <li>• First aid kit</li>
              <li>• Flashlight & batteries</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Health & Safety:</p>
            <ul className="space-y-1 text-xs">
              <li>• Prescribed medications</li>
              <li>• N95/P100 masks</li>
              <li>• Inhaler/medical devices</li>
              <li>• Pet supplies & carriers</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Communication:</p>
            <ul className="space-y-1 text-xs">
              <li>• Phone chargers</li>
              <li>• Portable power bank</li>
              <li>• Contact list (written)</li>
              <li>• Radio/news access</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}