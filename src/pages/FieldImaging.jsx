import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ImageCapture from "@/components/imaging/ImageCapture";
import LiveImageView from "@/components/imaging/LiveImageView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Image as ImageIcon } from "lucide-react";

export default function FieldImaging() {
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: zones = [] } = useQuery({
    queryKey: ['monitoredZones'],
    queryFn: () => base44.entities.MonitoredZone.list()
  });

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl font-bold text-white">Field Imaging & Detection</h1>
          <p className="text-sm text-slate-400 mt-1">Capture geotagged images and use AI to detect wildfires in real-time</p>
        </div>

        {/* Zone Selector */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm font-semibold text-white mb-3">Select Monitoring Zone</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  selectedZone?.id === zone.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="capture" className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none">
            <TabsTrigger value="capture" className="flex gap-2">
              <Camera className="w-4 h-4" /> Capture
            </TabsTrigger>
            <TabsTrigger value="view" className="flex gap-2">
              <ImageIcon className="w-4 h-4" /> Live View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="p-6">
            <ImageCapture
              zoneName={selectedZone?.name}
              province={selectedZone?.province}
              onImageCaptured={() => {}}
            />
          </TabsContent>

          <TabsContent value="view" className="p-6">
            <LiveImageView filterZone={selectedZone} filterRadius={50} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}