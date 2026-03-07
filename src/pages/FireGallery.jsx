import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Flame, Clock, TrendingUp } from "lucide-react";
import { CldImage } from "next-cloudinary";

export default function FireGalleryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, detected, user-uploaded

  const { data: capturedImages = [] } = useQuery({
    queryKey: ["capturedImages"],
    queryFn: () => base44.entities.CapturedImage.list(),
    refetchInterval: 30000,
  });

  const filteredImages = capturedImages.filter((img) => {
    const matchesSearch = 
      img.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.province?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "detected") return matchesSearch && img.wildfire_detected;
    if (filterType === "user-uploaded") return matchesSearch && img.wildfire_detected === false;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fire Gallery</h1>
          <p className="text-slate-400">Search and view fire images from monitoring zones and user uploads</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by zone name or province..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setFilterType("all")}
                variant={filterType === "all" ? "default" : "outline"}
                className={filterType === "all" ? "bg-amber-500" : ""}
              >
                All Images
              </Button>
              <Button
                onClick={() => setFilterType("detected")}
                variant={filterType === "detected" ? "default" : "outline"}
                className={filterType === "detected" ? "bg-red-500" : ""}
              >
                Wildfire Detected
              </Button>
              <Button
                onClick={() => setFilterType("user-uploaded")}
                variant={filterType === "user-uploaded" ? "default" : "outline"}
                className={filterType === "user-uploaded" ? "bg-blue-500" : ""}
              >
                User Uploads
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredImages.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Flame className="w-8 h-8 mx-auto mb-3 opacity-50" />
              No images found
            </div>
          ) : (
            filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group cursor-pointer bg-slate-900/50 rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-200"
              >
                <div className="relative h-48 bg-black/50 overflow-hidden">
                  {img.cloudinary_url && (
                    <img
                      src={img.cloudinary_url}
                      alt="Fire"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {img.wildfire_detected && (
                    <div className="absolute top-2 right-2 bg-red-500/90 px-3 py-1 rounded-full flex items-center gap-2">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs font-bold">{img.wildfire_confidence}%</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    {img.zone_name || img.province}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    {new Date(img.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-[#1a1a2e] rounded-xl border border-white/10 max-w-3xl w-full max-h-96 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="flex flex-col">
                  {selectedImage.cloudinary_url && (
                    <img
                      src={selectedImage.cloudinary_url}
                      alt="Fire"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Image Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-400">Zone:</span>
                        <span className="text-white ml-2">{selectedImage.zone_name || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Province:</span>
                        <span className="text-white ml-2">{selectedImage.province}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Coordinates:</span>
                        <span className="text-white ml-2">
                          {selectedImage.latitude.toFixed(4)}, {selectedImage.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Captured:</span>
                        <span className="text-white ml-2">
                          {new Date(selectedImage.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {selectedImage.wildfire_detected && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400 mb-2">
                            <Flame className="w-4 h-4" />
                            <span className="font-bold">Wildfire Detected</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Confidence: {selectedImage.wildfire_confidence}%</span>
                          </div>
                          {selectedImage.gemini_analysis && (
                            <p className="text-sm text-slate-300">{selectedImage.gemini_analysis}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedImage(null)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}