import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

const provinces = ["BC", "AB", "ON", "QC", "SK", "MB", "NB", "NS", "PE", "NL", "YT", "NT", "NU"];

export default function ZoneForm({ zone, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: zone?.name || "",
    province: zone?.province || "BC",
    latitude: zone?.latitude || "",
    longitude: zone?.longitude || "",
    radius_km: zone?.radius_km || 25,
    status: zone?.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius_km: parseFloat(form.radius_km),
    });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">{zone ? "Edit Zone" : "Add New Zone"}</h3>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Zone Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g. Okanagan Mountain Park"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Province</Label>
            <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Latitude</Label>
            <Input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="49.862"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Longitude</Label>
            <Input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="-119.496"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Radius (km)</Label>
            <Input
              type="number"
              value={form.radius_km}
              onChange={(e) => setForm({ ...form, radius_km: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="25"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="border-white/10 text-slate-300">
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : zone ? "Update Zone" : "Add Zone"}
          </Button>
        </div>
      </form>
    </div>
  );
}