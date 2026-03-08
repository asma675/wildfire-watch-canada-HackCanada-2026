import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Image as ImageIcon, Loader2 } from "lucide-react";

// Simulated drone fire images for demo
const DEMO_FIRE_IMAGES = [
  {
    id: "demo-1",
    zone_name: "BC Interior - Active Fire",
    timestamp: "2026-03-08T14:32:00Z",
    cloudinary_url: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=500&fit=crop",
    wildfire_detected: true,
    wildfire_confidence: 94,
    gemini_analysis: "High confidence wildfire detected. Active flame region with intense orange glow. Smoke plume extending northeast at estimated 8km altitude."
  },
  {
    id: "demo-2",
    zone_name: "Alberta Foothills - Spreading Fire",
    timestamp: "2026-03-08T13:45:00Z",
    cloudinary_url: "https://images.unsplash.com/photo-1628840042765-356cda07f04a?w=600&h=500&fit=crop",
    wildfire_detected: true,
    wildfire_confidence: 89,
    gemini_analysis: "Active wildfire with rapid spread rate. Multiple fire fronts detected. Dense smoke column visible. Estimated 150+ hectares affected. Risk of wind-driven spread."
  },
  {
    id: "demo-3",
    zone_name: "Saskatchewan - Drone Capture",
    timestamp: "2026-03-08T12:15:00Z",
    cloudinary_url: "https://images.unsplash.com/photo-1604537529428-15bcbd7dcfa3?w=600&h=500&fit=crop",
    wildfire_detected: true,
    wildfire_confidence: 91,
    gemini_analysis: "Drone thermal imaging confirms high-temperature fire zone. Fire intensity estimated at 65-75 MW. Ground-level vegetation combustion evident. Wind carrying embers eastward."
  },
  {
    id: "demo-4",
    zone_name: "Manitoba - Containment Zone",
    timestamp: "2026-03-08T11:20:00Z",
    cloudinary_url: "https://images.unsplash.com/photo-1513390516056-cf42e2c86fda?w=600&h=500&fit=crop",
    wildfire_detected: true,
    wildfire_confidence: 88,
    gemini_analysis: "Established firebreak visible. Fire contained to designated zone. Controlled burn showing expected behavior. Ground crews monitoring perimeter. No spread detected in last 3 hours."
  },
];

export default function FireImageGallery() {
  const [expanded, setExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch real images from database if available
  const { data: capturedImages = [] } = useQuery({
    queryKey: ["capturedImages"],
    queryFn: () => base44.entities.CapturedImage.list("-timestamp", 100).catch(() => []),
  });

  // Use real images if available, otherwise use demo images
  const images = capturedImages.length > 0 ? capturedImages : DEMO_FIRE_IMAGES;

  const fireImages = images.filter(img => img.wildfire_detected);
  const demoIndicator = capturedImages.length === 0;

  if (!expanded) {
    return (
      <div className="border-t border-white/5">
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
        >
          <ChevronUp className="w-4 h-4 text-slate-400" />
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Fire Images ({fireImages.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(false)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <ChevronDown className="w-4 h-4 text-slate-400" />
        <ImageIcon className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-white">Fire Images ({fireImages.length})</span>
        {demoIndicator && <span className="ml-auto text-[10px] text-amber-400 font-semibold">DEMO</span>}
      </button>

      {/* Gallery */}
      <div className="px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto">
        {fireImages.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">No fire images captured yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {fireImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="relative group cursor-pointer overflow-hidden rounded-lg aspect-video"
              >
                <img
                  src={img.cloudinary_url}
                  alt={img.zone_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-[10px] font-semibold text-white truncate">{img.zone_name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <p className="text-[10px] text-red-200">{img.wildfire_confidence}% fire</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedImage && (
        <div className="border-t border-white/5 p-4 space-y-3 bg-black/20">
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ✕ Close details
          </button>

          <img
            src={selectedImage.cloudinary_url}
            alt={selectedImage.zone_name}
            className="w-full h-40 object-cover rounded-lg border border-white/10"
          />

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Zone</p>
              <p className="text-white">{selectedImage.zone_name}</p>
            </div>

            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Wildfire Detection</p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedImage.wildfire_detected ? "bg-red-400" : "bg-green-400"
                  }`}
                />
                <span className={selectedImage.wildfire_detected ? "text-red-300" : "text-green-300"}>
                  {selectedImage.wildfire_detected ? "DETECTED" : "CLEAR"}
                </span>
                <span className="text-slate-500">
                  ({selectedImage.wildfire_confidence}% confidence)
                </span>
              </div>
            </div>

            {selectedImage.gemini_analysis && (
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">AI Analysis</p>
                <p className="text-slate-300 leading-relaxed">{selectedImage.gemini_analysis}</p>
              </div>
            )}

            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Captured</p>
              <p className="text-slate-400">
                {new Date(selectedImage.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}