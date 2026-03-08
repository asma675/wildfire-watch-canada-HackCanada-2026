import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminWildfireEvents() {
  const [showForm, setShowForm] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [formData, setFormData] = useState({
    title: '',
    latitude: '',
    longitude: '',
    severity: 'advisory',
    guidance_text: '',
    health_risk_text: '',
    evacuation_text: ''
  });

  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['wildfireEvents'],
    queryFn: () => base44.entities.WildfireEvent.list('-created_date', 50)
  });

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.entities.WildfireEvent.create({
        title: formData.title,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severity: formData.severity,
        source: 'Manual',
        status: 'active',
        detected_at: new Date().toISOString(),
        guidance_text: formData.guidance_text,
        health_risk_text: formData.health_risk_text,
        evacuation_text: formData.evacuation_text
      });
      return res;
    },
    onSuccess: () => {
      setFormData({ title: '', latitude: '', longitude: '', severity: 'advisory', guidance_text: '', health_risk_text: '', evacuation_text: '' });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['wildfireEvents'] });
    }
  });

  const sendAlertsMutation = useMutation({
    mutationFn: (eventId) => base44.functions.invoke('sendWildfireAlerts', { wildfire_event_id: eventId })
  });

  const testSmsMutation = useMutation({
    mutationFn: () => base44.functions.invoke('testSendSms', { phone_number: testPhone })
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Wildfire Event Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Admin tool: Create and manage wildfire events</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
        >
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {/* Create Event Form */}
      {showForm && (
        <Card className="bg-[#1a1a2e] border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create Wildfire Event</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={formData.severity}
              onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="advisory">Advisory</option>
              <option value="warning">Warning</option>
              <option value="evacuation">Evacuation</option>
            </select>
            <textarea
              placeholder="Health risk text"
              value={formData.health_risk_text}
              onChange={(e) => setFormData(prev => ({ ...prev, health_risk_text: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
            />
            <textarea
              placeholder="Safety guidance"
              value={formData.guidance_text}
              onChange={(e) => setFormData(prev => ({ ...prev, guidance_text: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
            />
            <textarea
              placeholder="Evacuation instructions"
              value={formData.evacuation_text}
              onChange={(e) => setFormData(prev => ({ ...prev, evacuation_text: e.target.value }))}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => createEventMutation.mutate()}
                disabled={!formData.title || !formData.latitude || !formData.longitude || createEventMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Create Event
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 border-white/10 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Test SMS */}
      <Card className="bg-[#1a1a2e] border border-white/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Test SMS Alert</h2>
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="Phone number to test (+1...)"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Button
            onClick={() => testSmsMutation.mutate()}
            disabled={!testPhone || testSmsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
          >
            <Send className="w-4 h-4" /> Send Test
          </Button>
        </div>
      </Card>

      {/* Events List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Flame className="w-5 h-5" /> Recent Events</h2>
        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <div className="grid gap-3">
            {events.map((event) => (
              <Card key={event.id} className="bg-[#1a1a2e] border border-white/10 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)} • {event.severity} • {event.status}
                  </p>
                </div>
                {event.status === 'active' && (
                  <Button
                    onClick={() => sendAlertsMutation.mutate(event.id)}
                    disabled={sendAlertsMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Alerts
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}