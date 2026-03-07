import React from "react";

const levels = {
  EXTREME: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400" },
  HIGH: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-400" },
  MODERATE: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
  LOW: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", dot: "bg-green-400" },
};

export default function ThreatBadge({ level, size = "sm" }) {
  const s = levels[level] || levels.LOW;
  const px = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${s.bg} ${s.text} ${s.border} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${level === "EXTREME" ? "threat-pulse" : ""}`} />
      {level}
    </span>
  );
}