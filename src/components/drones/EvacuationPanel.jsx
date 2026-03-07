import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Loader2, Volume2, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'french', label: 'Français' },
  { code: 'spanish', label: 'Español' },
  { code: 'ukrainian', label: 'Українська' },
  { code: 'urdu', label: 'اردو' },
  { code: 'hindi', label: 'हिन्दी' }
];

export default function EvacuationPanel({ drone, zone, wearable, onClose }) {
  const [guidance, setGuidance] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const getEvacuationGuidance = async () => {
    setLoading(true);
    setGuidance("");
    try {
      const res = await base44.functions.invoke("droneAIGuidance", {
        mode: "evacuation_guidance",
        drone,
        wearable: wearable || null,
        zone: zone || null
      });
      setGuidance(res.data?.guidance || "No guidance available.");
    } catch (err) {
      setGuidance("Failed to generate evacuation guidance. Please try again.");
    }
    setLoading(false);
  };

  const speakGuidance = async () => {
    if (!guidance) return;
    setSpeaking(true);
    try {
      const res = await base44.functions.invoke("droneSpeak", {
        text: guidance,
        language
      });
      const audio = new Audio(`data:audio/mpeg;base64,${res.data?.audio_base64}`);
      audio.play();
      setTimeout(() => setSpeaking(false), 3000);
    } catch (err) {
      alert("Voice playback failed");
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-300">
        <Navigation className="w-4 h-4" />
        <h3 className="font-semibold text-sm">Evacuation Guidance</h3>
      </div>

      <Button
        onClick={getEvacuationGuidance}
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        Generate Escape Routes
      </Button>

      {guidance && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  language === lang.code
                    ? "bg-amber-500 text-white border border-amber-400"
                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <Button
            onClick={speakGuidance}
            disabled={speaking}
            variant="outline"
            className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10 gap-2"
          >
            {speaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            Drone Speaks ({LANGUAGES.find(l => l.code === language)?.label})
          </Button>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> Escape Route
            </p>
            <div className="prose prose-sm prose-invert max-w-none text-xs [&>*]:text-slate-300 [&>h1,&>h2,&>h3]:text-white [&>h1,&>h2,&>h3]:font-semibold [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
              <ReactMarkdown>{guidance}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}