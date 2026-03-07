import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Flame } from "lucide-react";

export default function LiveImageView({ filterZone, filterRadius = 50 }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: allImages, isLoading } = useQuery({
    queryKey: ['capturedImages'],
    queryFn: () => base44.entities.CapturedImage.list('-created_date', 100),
    initialData: [],
    refetchInterval: 5000
  });

  // Filter images by location
  const filteredImages = allImages.filter((img) => {
    if (!filterZone) return true;
    if (filterZone.name !== img.zone_name) return false;

    const lat1 = filterZone.latitude;
    const lon1 = filterZone.longitude;
    const lat2 = img.latitude;
    const lon2 = img.longitude;

    // Haversine distance calculation (in km)
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= filterRadius;
  });

  const wildfireImages = filteredImages.filter(img => img.wildfire_detected);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-slate-500 mb-1">Total Captures</p>
          <p className="text-2xl font-bold text-white">{filteredImages.length}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
          <p className="text-xs text-red-400 mb-1">Wildfire Detected</p>
          <p className="text-2xl font-bold text-red-300">{wildfireImages.length}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
          <p className="text-xs text-amber-400 mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-amber-300">
            {filteredImages.length > 0
              ? Math.round(filteredImages.reduce((sum, img) => sum + (img.wildfire_confidence || 0), 0) / filteredImages.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              img.wildfire_detected
                ? 'border-red-500 bg-red-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="relative overflow-hidden bg-black/50 aspect-square">
              <img
                src={img.cloudinary_url}
                alt="Captured"
                className="w-full h-full object-cover"
              />
              {img.wildfire_detected && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-400" />
                </div>
              )}
            </div>
            <div className="p-2 text-xs">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <MapPin className="w-3 h-3" />
                {img.latitude.toFixed(2)}, {img.longitude.toFixed(2)}
              </div>
              <p className={img.wildfire_detected ? 'text-red-400 font-semibold' : 'text-green-400'}>
                {img.wildfire_detected ? 'Fire Detected' : 'Clear'} ({img.wildfire_confidence}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail View */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedImage(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a2e] rounded-xl p-4 max-w-2xl w-full border border-white/10 space-y-3"
          >
            <img src={selectedImage.cloudinary_url} alt="Full" className="w-full rounded-lg" />
            <div className="space-y-2">
              <p className="text-sm text-white font-semibold">Analysis</p>
              <p className="text-xs text-slate-300">{selectedImage.gemini_analysis}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-500">Location</p>
                  <p className="text-white font-mono">{selectedImage.latitude.toFixed(4)}, {selectedImage.longitude.toFixed(4)}</p>
                </div>
                <div className={`p-2 rounded ${selectedImage.wildfire_detected ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <p className={selectedImage.wildfire_detected ? 'text-red-400' : 'text-green-400'}>Status</p>
                  <p className="text-white font-semibold">{selectedImage.wildfire_detected ? 'Fire Detected' : 'Clear'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}