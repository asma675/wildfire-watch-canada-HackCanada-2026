import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ImageCapture({ zoneName, province, onImageCaptured }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [lastCapture, setLastCapture] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          setError(`Location error: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const captureFromCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const video = videoRef.current;
    video.srcObject = stream;

    await video.play();

    video.onloadeddata = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        stream.getTracks().forEach(track => track.stop());
        await uploadImage(blob);
      }, "image/jpeg", 0.9);
    };

  } catch (err) {
    setError("Camera access denied");
  }
};

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImage(file);
  };

  const uploadImage = async (blob) => {
   setLoading(true);
   setError(null);
   try {
     const reader = new FileReader();
     reader.onload = async () => {
       try {
         const base64 = reader.result.split(',')[1];

         // Use Waterloo demo coordinates if geolocation not available
         const lat = location?.latitude || 43.4516;
         const lon = location?.longitude || -80.4925;

         const response = await base44.functions.invoke('uploadGeotaggedImage', {
           image: base64,
           imageType: blob.type,
           latitude: lat,
           longitude: lon,
           zone_name: zoneName || 'Waterloo Demo',
           province: province || 'ON'
         });

         setLastCapture({
           url: response.data.cloudinary_url,
           analysis: response.data.analysis,
           success: response.data.success
         });

         if (onImageCaptured) {
           onImageCaptured(response.data.image);
         }
       } catch (err) {
         setError(`Upload failed: ${err.message}`);
       } finally {
         setLoading(false);
       }
     };
     reader.onerror = () => {
       setError("Failed to read image");
       setLoading(false);
     };
     reader.readAsDataURL(blob);
   } catch (err) {
     setError(`Upload failed: ${err.message}`);
     setLoading(false);
   }
  };

  return (
    <div className="space-y-3">
      {/* Location Status */}
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-amber-400" />
        {location ? (
          <span className="text-slate-300">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} (Waterloo, ON)
          </span>
        ) : (
          <span className="text-slate-500">Using Demo Location: Waterloo, ON (43.4516, -80.4925)</span>
        )}
      </div>

      {/* Capture Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={captureFromCamera}
          disabled={loading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          Capture Photo
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 border-white/10 text-slate-300"
        >
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Last Capture Result */}
      {lastCapture && (
        <div className={`rounded-xl border p-4 space-y-3 ${
          lastCapture.analysis.wildfire_detected
            ? 'border-red-500/40 bg-red-500/10'
            : 'border-green-500/40 bg-green-500/10'
        }`}>
          {/* Status banner */}
          <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            lastCapture.analysis.wildfire_detected ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            {lastCapture.analysis.wildfire_detected ? (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold ${lastCapture.analysis.wildfire_detected ? 'text-red-300' : 'text-green-300'}`}>
                {lastCapture.analysis.wildfire_detected ? "⚠ Wildfire Detected" : "✓ No Fire Detected"}
              </p>
              <p className="text-xs text-slate-400">
                {lastCapture.analysis.rag_verified ? 'AI + RAG verified · ' : ''}
                Confidence: {lastCapture.analysis.confidence}%
              </p>
            </div>
          </div>

          {/* Analysis text */}
          <p className="text-xs text-slate-300 leading-relaxed">{lastCapture.analysis.analysis}</p>

          {/* Image */}
          <img src={lastCapture.url} alt="Captured" className="w-full rounded-lg max-h-52 object-cover" />
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}