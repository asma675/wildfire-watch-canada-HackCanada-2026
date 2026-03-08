import React, { useState } from "react";
import {
  Heart, AlertTriangle, Users, Wind, Thermometer, Eye,
  ShieldAlert, ChevronDown, Activity, Brain, Baby
} from "lucide-react";

const topics = [
  {
    id: "symptoms",
    title: "Symptoms of Smoke Exposure",
    icon: Activity,
    color: "red",
    content: [
      { heading: "Mild Exposure", items: ["Irritated eyes (burning, watering)", "Runny nose and sinus irritation", "Mild cough", "Scratchy throat", "Headache"] },
      { heading: "Moderate Exposure", items: ["Persistent cough and wheezing", "Shortness of breath", "Chest tightness", "Dizziness or lightheadedness", "Fatigue and reduced alertness"] },
      { heading: "Severe Exposure", items: ["Difficulty breathing", "Severe chest pain", "Confusion or disorientation", "Blue tint to lips or fingernails (cyanosis)", "Loss of consciousness — call 911 immediately"] },
    ],
  },
  {
    id: "vulnerable",
    title: "Who Is Most Vulnerable",
    icon: Users,
    color: "amber",
    content: [
      { heading: "High-Risk Groups", items: [
        "Children under 14 — smaller airways and higher breathing rates",
        "Adults over 65 — reduced lung capacity and immune function",
        "Pregnant women — risk to both mother and developing fetus",
        "People with asthma, COPD, or chronic bronchitis",
        "People with cardiovascular disease",
        "Outdoor workers (construction, agriculture, firefighters)",
        "People experiencing homelessness with limited shelter access",
        "Indigenous communities in remote areas with limited healthcare access",
      ]},
    ],
  },
  {
    id: "lungs",
    title: "How Smoke Affects Your Lungs & Health",
    icon: Wind,
    color: "purple",
    content: [
      { heading: "Particulate Matter (PM2.5)", items: [
        "Wildfire smoke contains fine particles (PM2.5) that are 30x smaller than a human hair",
        "These particles penetrate deep into the lungs and can enter the bloodstream",
        "They cause inflammation in the airways and lungs",
        "PM2.5 triggers the body's stress response, increasing heart rate and blood pressure",
      ]},
      { heading: "Long-Term Effects", items: [
        "Repeated exposure can cause permanent reduction in lung function",
        "Increased risk of heart attacks and strokes",
        "Worsening of existing respiratory conditions",
        "Potential links to cognitive decline and neurological effects",
        "Increased susceptibility to respiratory infections",
      ]},
      { heading: "Chemical Compounds", items: [
        "Carbon monoxide — reduces oxygen delivery to organs",
        "Formaldehyde — irritates lungs and is a known carcinogen",
        "Acrolein — one of the most toxic compounds in smoke",
        "Benzene — a known carcinogen present in wildfire smoke",
      ]},
    ],
  },
  {
    id: "indoors",
    title: "When to Stay Indoors",
    icon: ShieldAlert,
    color: "blue",
    content: [
      { heading: "AQI Thresholds", items: [
        "AQI 0–50 (Good) — Normal outdoor activities are safe",
        "AQI 51–100 (Moderate) — Sensitive groups should limit prolonged outdoor exertion",
        "AQI 101–150 (Unhealthy for Sensitive) — Stay indoors if you have respiratory or heart conditions",
        "AQI 151–200 (Unhealthy) — Everyone should reduce outdoor activity, sensitive groups stay indoors",
        "AQI 201–300 (Very Unhealthy) — Everyone should stay indoors. Use HEPA purifiers.",
        "AQI 301+ (Hazardous) — Stay indoors with all windows/doors sealed. Consider evacuation if prolonged.",
      ]},
      { heading: "Indoor Protection", items: [
        "Close all windows and doors, seal gaps with wet towels if needed",
        "Run HVAC on recirculation mode (do NOT bring in outside air)",
        "Use portable HEPA air purifiers in main living and sleeping areas",
        "Avoid activities that create indoor pollution (cooking with gas, candles, smoking)",
        "Create a 'clean room' — one sealed room with a HEPA purifier running",
      ]},
    ],
  },
  {
    id: "medical",
    title: "When to Seek Medical Help",
    icon: Heart,
    color: "green",
    content: [
      { heading: "Seek Immediate Medical Attention If", items: [
        "You experience severe difficulty breathing or cannot catch your breath",
        "You have persistent chest pain or pressure",
        "You feel confused, disoriented, or extremely fatigued",
        "Your lips or fingernails turn blue or grey",
        "You have asthma and your inhaler is not providing relief",
        "A child shows signs of respiratory distress (rapid breathing, nostril flaring, retractions)",
        "You lose consciousness or someone near you does",
      ]},
      { heading: "Call Your Doctor If", items: [
        "Cough persists for more than a few days after smoke clears",
        "You notice decreased exercise tolerance",
        "Existing conditions (asthma, COPD) worsen despite medication",
        "You develop new respiratory symptoms after smoke exposure",
        "You experience persistent headaches, nausea, or dizziness",
      ]},
    ],
  },
];

const colorClasses = {
  red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400", dot: "bg-red-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", dot: "bg-amber-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400", dot: "bg-purple-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", dot: "bg-blue-400" },
  green: { bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400", dot: "bg-green-400" },
};

export default function HealthImpactContent() {
  const [open, setOpen] = useState("symptoms");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="text-sm text-slate-400 mt-1">Understanding the risks and how to protect yourself</p>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-400">Medical Emergency?</p>
          <p className="text-xs text-slate-400 mt-1">
            If you or someone near you is having difficulty breathing, call 911 immediately. If in a smoke-affected area, seek clean indoor air as soon as possible.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#1a1a2e] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Air Quality Index Quick Reference</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: "Good", range: "0-50", color: "#22c55e" },
            { label: "Moderate", range: "51-100", color: "#f59e0b" },
            { label: "Unhealthy*", range: "101-150", color: "#f97316" },
            { label: "Unhealthy", range: "151-200", color: "#ef4444" },
            { label: "Very Bad", range: "201-300", color: "#991b1b" },
            { label: "Hazardous", range: "301+", color: "#7f1d1d" },
          ].map((a) => (
            <div key={a.label} className="text-center">
              <div className="w-full h-2 rounded-full mb-1.5" style={{ background: a.color }} />
              <p className="text-[10px] font-semibold text-white">{a.label}</p>
              <p className="text-[10px] text-slate-500">{a.range}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2">* Unhealthy for sensitive groups</p>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => {
          const c = colorClasses[topic.color];
          const isOpen = open === topic.id;
          return (
            <div key={topic.id} className={`rounded-2xl border ${isOpen ? c.border : "border-white/5"} overflow-hidden transition-all`}>
              <button
                onClick={() => setOpen(isOpen ? null : topic.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all ${isOpen ? c.bg : "hover:bg-white/[0.02]"}`}
              >
                <div className={`p-2 rounded-xl ${c.bg}`}>
                  <topic.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <span className="text-base font-semibold text-white flex-1">{topic.title}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4">
                  {topic.content.map((block, bi) => (
                    <div key={bi}>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{block.heading}</h4>
                      <div className="space-y-1.5">
                        {block.items.map((item, ii) => (
                          <div key={ii} className="flex items-start gap-3 py-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                            <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}