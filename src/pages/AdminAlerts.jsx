import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Send, AlertTriangle } from "lucide-react";

export default function AdminAlerts() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [severity, setSeverity] = useState("advisory");
  const [source, setSource] = useState("Manual Test");
  const [guidance, setGuidance] = useState("");
  const [healthRisk, setHealthRisk] = useState("");
  const [evacuation, setEvacuation] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["wildfireEvents"],
    queryFn: () => base44.asServiceRole.entities.WildfireEvent.list("-created_date", 50)
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const evt = await base44.asServiceRole.entities.WildfireEvent.create({
        ...eventData,
        detected_at: new Date().toISOString(),
        status: "active"
      });
      return evt;
    },
    onSuccess: () => {
      setTitle("");
      setLatitude("");
      setLongitude("");
      setSeverity("advisory");
      setGuidance("");
      setHealthRisk("");
      setEvacuation("");
      qc.invalidateQueries({ queryKey: ["wildfireEvents"] });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.WildfireEvent.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wildfireEvents"] })
  });

  const sendAlertsMutation = useMutation({
    mutationFn: async (eventId) => {
      const res = await base44.functions.invoke('sendWildfireAlerts', { wildfire_event_id: eventId });
      return res.data;
    }
  });

  const handleCreateEvent = async () => {
    if (!title || !latitude || !longitude) {
      alert("Fill in title, latitude, and longitude");
      return;
    }

    await createEventMutation.mutateAsync({
      title,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      severity,
      source,
      guidance_text: guidance || null,
      health_risk_text: healthRisk || null,
      evacuation_text: evacuation || null
    });
  };

  if (!user) {
    return <div className="p-6 text-slate-400">Please log in</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Admin access required
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin: Fire Alerts</h1>
        <p className="text-slate-400">Create test wildfire events and send alerts</p>
      </div>

      {/* Create Event Form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create Test Fire Event</h2>

        <Input
          placeholder="Fire title (e.g., 'Wildcat Fire')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <Input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
          >
            <option value="advisory">Advisory</option>
            <option value="warning">Warning</option>
            <option value="evacuation">Evacuation</option>
          </select>
        </div>

        <textarea
          placeholder="Guidance text (optional)"
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
          rows={2}
        />

        <textarea
          placeholder="Health risk text (optional)"
          value={healthRisk}
          onChange={(e) => setHealthRisk(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
          rows={2}
        />

        <textarea
          placeholder="Evacuation text (optional)"
          value={evacuation}
          onChange={(e) => setEvacuation(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
          rows={2}
        />

        <Button
          onClick={handleCreateEvent}
          disabled={createEventMutation.isPending}
          className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
        >
          {createEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Event
        </Button>
      </div>

      {/* Active Events */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Active Events</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-slate-500 text-sm">No events yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{evt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)} • {evt.severity} • {evt.source}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => sendAlertsMutation.mutate(evt.id)}
                      disabled={sendAlertsMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-white/10 gap-1"
                    >
                      <Send className="w-3 h-3" />
                      {sendAlertsMutation.isPending ? "Sending..." : "Send Alerts"}
                    </Button>
                    <Button
                      onClick={() => deleteEventMutation.mutate(evt.id)}
                      disabled={deleteEventMutation.isPending}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {sendAlertsMutation.data && sendAlertsMutation.data.event_id === evt.id && (
                  <div className="text-xs text-green-400 mt-2">
                    ✓ Alerts sent to {sendAlertsMutation.data.affected_users} user(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}