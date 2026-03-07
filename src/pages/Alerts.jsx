import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import AlertItem from "@/components/dashboard/AlertItem";
import ThreatBadge from "@/components/dashboard/ThreatBadge";
import {
  Bell, Plus, Trash2, Building2, Mail, Phone, X, Save, Loader2, ShieldAlert
} from "lucide-react";

export default function Alerts() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ org_name: "", contact_email: "", contact_phone: "", province: "BC", threshold_level: "HIGH", is_active: true });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const qc = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ["alertConfigs"],
    queryFn: () => base44.entities.AlertConfig.list("-created_date", 50),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["alertHistory"],
    queryFn: () => base44.entities.AlertHistory.list("-created_date", 50),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.AlertConfig.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alertConfigs"] }); setShowForm(false); setForm({ org_name: "", contact_email: "", contact_phone: "", province: "BC", threshold_level: "HIGH", is_active: true }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.AlertConfig.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertConfigs"] }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.AlertConfig.update(id, { is_active: active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertConfigs"] }),
  });

  const handleCheckNow = async () => {
    setChecking(true);
    setCheckResult(null);
    const res = await base44.functions.invoke("checkZoneAlerts", {});
    setCheckResult(res.data);
    qc.invalidateQueries({ queryKey: ["alertHistory"] });
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await createMut.mutateAsync(form);
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Alert System</h1>
          <p className="text-sm text-slate-400 mt-1">Configure emergency notifications</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleCheckNow}
            disabled={checking}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            {checking ? "Checking…" : "Check Zones Now"}
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
            <Plus className="w-4 h-4" /> Add Recipient
          </Button>
        </div>
      </div>

      {checkResult && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${checkResult.triggered > 0 ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}>
          <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${checkResult.triggered > 0 ? "text-red-400" : "text-green-400"}`} />
          <div>
            <p className={`text-sm font-semibold ${checkResult.triggered > 0 ? "text-red-300" : "text-green-300"}`}>
              {checkResult.triggered > 0
                ? `${checkResult.triggered} alert(s) triggered across ${checkResult.checked} configurations`
                : `All clear — ${checkResult.checked} configuration(s) checked, no thresholds breached`}
            </p>
            {checkResult.details?.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {checkResult.details.map((d, i) => (
                  <li key={i} className="text-xs text-slate-400">
                    • {d.org} ({d.province}): {d.zonesTriggered} zone(s) — email {d.emailStatus}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => setCheckResult(null)} className="ml-auto p-1 text-slate-500 hover:text-slate-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">New Alert Recipient</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Organization Name</Label>
                <Input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} className="bg-white/5 border-white/10 text-white" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Contact Email</Label>
                <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="bg-white/5 border-white/10 text-white" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Phone Number</Label>
                <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Province</Label>
                <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["BC", "AB", "ON", "QC", "SK", "MB"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Alert Threshold</Label>
                <Select value={form.threshold_level} onValueChange={(v) => setForm({ ...form, threshold_level: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["LOW", "MODERATE", "HIGH", "EXTREME"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-slate-300">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recipients */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" /> Alert Recipients
          </h2>
          {configs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 rounded-2xl border border-dashed border-white/10">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recipients configured</p>
            </div>
          ) : (
            configs.map((cfg) => (
              <div key={cfg.id} className="rounded-2xl border border-white/5 bg-[#1a1a2e]/80 p-4 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cfg.org_name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {cfg.contact_email}</span>
                      {cfg.contact_phone && <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {cfg.contact_phone}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <ThreatBadge level={cfg.threshold_level} />
                      <span className="text-xs text-slate-500">{cfg.province}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cfg.is_active !== false}
                      onCheckedChange={(v) => toggleMut.mutate({ id: cfg.id, active: v })}
                    />
                    <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(cfg.id)} className="h-7 px-2 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert History */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Alert History
          </h2>
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 rounded-2xl border border-dashed border-white/10">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((a) => <AlertItem key={a.id} alert={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}