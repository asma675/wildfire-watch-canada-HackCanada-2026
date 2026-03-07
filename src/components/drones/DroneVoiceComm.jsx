import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mic, Square, Volume2, Globe } from "lucide-react";

export default function DroneVoiceComm({ drone }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("English");
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        setLastMessage(transcript);
        await getDroneResponse(transcript);
      };
    }
  }, [drone]);

  const getDroneResponse = async (spokenText) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("droneVoiceAssistant", {
        spokenText,
        droneId: drone.id,
        personLocation: {
          latitude: drone.latitude,
          longitude: drone.longitude,
        },
      });

      setDetectedLanguage(response.detectedLanguage);
      await speakResponse(response.guidance, response.languageCode);
    } catch (error) {
      console.error("Error:", error);
      await speakResponse("Unable to process request. Please try again.", "en");
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text, languageCode) => {
    return new Promise((resolve) => {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      synthRef.current.speak(utterance);
    });
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-700/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Detected Language:</span>
          <span className="font-semibold text-amber-400">{detectedLanguage}</span>
        </div>

        {lastMessage && (
          <div className="rounded bg-slate-600/40 p-3">
            <p className="text-xs text-slate-500 mb-1">Last spoken command:</p>
            <p className="text-sm text-slate-200">{lastMessage}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isListening ? (
          <Button
            onClick={startListening}
            disabled={loading || isSpeaking}
            className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2"
          >
            <Mic className="w-4 h-4" />
            Listen to Person
          </Button>
        ) : (
          <Button
            onClick={stopListening}
            className="flex-1 bg-red-500 hover:bg-red-600 gap-2 animate-pulse"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}

        {isSpeaking && (
          <Button disabled className="flex-1 bg-slate-600 gap-2">
            <Volume2 className="w-4 h-4 animate-pulse" />
            Speaking...
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-center text-sm text-slate-400">
          Processing voice command...
        </div>
      )}
    </div>
  );
}