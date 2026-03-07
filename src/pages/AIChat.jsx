import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mic, Square, MessageCircle, Volume2 } from "lucide-react";

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        // Add user message
        const userMessage = { role: "user", content: transcript };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        await getAIResponse(transcript);
      };
    }
  }, []);

  const getAIResponse = async (userInput) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("aiChatbotVoice", {
        message: userInput,
      });

      const aiMessage = { role: "assistant", content: response.data.response };
      setMessages((prev) => [...prev, aiMessage]);

      // Speak the response
      await speakResponse(response.data.response);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = async (text) => {
    setIsSpeaking(true);
    try {
      const response = await base44.functions.invoke("textToSpeech", { text });
      const audio = new Audio(`data:audio/mpeg;base64,${response.data.audioBase64}`);
      audio.onended = () => setIsSpeaking(false);
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
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
    <div className="min-h-screen bg-[#0f0f1a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wildfire AI Assistant</h1>
          <p className="text-slate-400">
            Ask me anything about wildfires, health risks, or mental health support. Speak naturally.
          </p>
        </div>

        {/* Chat Display */}
        <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6 mb-6 min-h-96 max-h-96 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <MessageCircle className="w-8 h-8 mr-3" />
              Start speaking to begin the conversation
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-amber-500/20 text-amber-100 border border-amber-500/30"
                      : "bg-slate-700/50 text-slate-100 border border-slate-600/30"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 px-4 py-3 rounded-lg text-slate-400 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isListening ? (
            <Button
              onClick={startListening}
              disabled={loading || isSpeaking}
              className="bg-amber-500 hover:bg-amber-600 gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Speaking
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              className="bg-red-500 hover:bg-red-600 gap-2 animate-pulse"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}

          {isSpeaking && (
            <Button disabled className="bg-slate-600 gap-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Speaking...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}