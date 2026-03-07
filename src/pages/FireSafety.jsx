import React, { useState } from "react";
import {
  Flame, Home, PackageCheck, Wind, AlertTriangle, ChevronDown,
  ShieldCheck, Truck, Droplets, Eye
} from "lucide-react";

const sections = [
  {
    id: "before",
    title: "Before a Wildfire",
    icon: ShieldCheck,
    color: "amber",
    items: [
      "Create a defensible space of at least 10 metres around your home by clearing dry brush, leaves, and flammable materials.",
      "Keep your roof and gutters clean from pine needles and debris.",
      "Store firewood at least 10 metres from buildings.",
      "Install spark arrestors on chimneys and stovepipes.",
      "Ensure your property address is clearly visible for emergency responders.",
      "Prepare an emergency kit with 72 hours of supplies including water, food, medications, and important documents.",
      "Know at least two evacuation routes from your area.",
      "Register for local emergency alert systems (e.g., BC Emergency Alert, Alberta Emergency Alert).",
      "Have a family communication plan with a meeting point outside the danger zone.",
    ],
  },
  {
    id: "during",
    title: "During an Evacuation",
    icon: Truck,
    color: "red",
    items: [
      "Leave immediately when ordered — do not wait. Delays cost lives.",
      "Wear long sleeves, long pants, and a mask (N95 if possible) to protect from smoke.",
      "Close all windows, doors, and vents in your home before leaving.",
      "Turn off gas and propane supplies.",
      "Move flammable furniture away from windows.",
      "Leave exterior lights on so firefighters can see your home in smoke.",
      "Take your emergency kit, important documents, medications, and phone charger.",
      "Drive with headlights on and windows up.",
      "Follow designated evacuation routes — do not take shortcuts through fire zones.",
    ],
  },
  {
    id: "smoke",
    title: "During High Smoke Events",
    icon: Wind,
    color: "purple",
    items: [
      "Stay indoors with windows and doors closed. Use recirculation mode on HVAC.",
      "Use HEPA air purifiers to maintain indoor air quality.",
      "Avoid strenuous outdoor activities, especially for children, elderly, and those with respiratory conditions.",
      "Monitor local AQI (Air Quality Index) readings regularly.",
      "Wear a properly fitted N95 or P100 mask if you must go outside.",
      "Drink plenty of water to stay hydrated.",
      "Watch for symptoms: coughing, shortness of breath, burning eyes, dizziness.",
      "Keep pets indoors and ensure they have fresh water.",
      "If AQI exceeds 200, consider relocating to a cleaner air area.",
    ],
  },
  {
    id: "home",
    title: "Home Protection Tips",
    icon: Home,
    color: "blue",
    items: [
      "Use fire-resistant roofing materials (metal, tile, Class A shingles).",
      "Enclose eaves, soffits, and vents with 3mm metal mesh to prevent ember entry.",
      "Use non-combustible siding materials.",
      "Install multi-pane or tempered glass windows.",
      "Keep a garden hose connected and ready (if water pressure allows).",
      "Consider installing exterior sprinklers on your roof and around the home perimeter.",
      "Remove dead vegetation, leaves, and branches from within 10 metres of your home.",
      "Use fire-resistant plants and landscaping in your yard.",
    ],
  },
  {
    id: "kit",
    title: "Emergency Kit Checklist",
    icon: PackageCheck,
    color: "green",
    items: [
      "✓ Water — 4 litres per person per day for at least 3 days",
      "✓ Non-perishable food for 72 hours",
      "✓ Manual can opener",
      "✓ Flashlight and extra batteries",
      "✓ Battery-powered or hand-crank radio",
      "✓ First aid kit with prescription medications",
      "✓ N95 masks for each family member",
      "✓ Copies of important documents (ID, insurance, medical records) in a waterproof bag",
      "✓ Cash in small denominations",
      "✓ Phone charger and backup battery pack",
      "✓ Whistle for signalling",
      "✓ Blankets or sleeping bags",
      "✓ Change of clothes and sturdy shoes",
      "✓ Pet supplies (food, leash, carrier, medical records)",
      "✓ Maps of your local area with marked evacuation routes",
    ],
  },
];

const colorClasses = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", dot: "bg-amber-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400", dot: "bg-red-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400", dot: "bg-purple-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", dot: "bg-blue-400" },
  green: { bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400", dot: "bg-green-400" },
};

export default function FireSafety() {
  const [open, setOpen] = useState("before");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Fire Safety & Preparedness</h1>
        <p className="text-sm text-slate-400 mt-1">Essential guidance to protect yourself and your family</p>
      </div>

      {/* Emergency Banner */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-400">In immediate danger? Call 911</p>
          <p className="text-xs text-slate-400 mt-1">
            If you see a wildfire, smell smoke, or receive an evacuation order, act immediately. Follow official emergency guidance from your province.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const c = colorClasses[section.color];
          const isOpen = open === section.id;
          return (
            <div key={section.id} className={`rounded-2xl border ${isOpen ? c.border : "border-white/5"} overflow-hidden transition-all`}>
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all ${isOpen ? c.bg : "hover:bg-white/[0.02]"}`}
              >
                <div className={`p-2 rounded-xl ${c.bg}`}>
                  <section.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <span className="text-base font-semibold text-white flex-1">{section.title}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                      <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
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