import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Brain, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function RAGChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize Backboard assistant + thread
  useEffect(() => {
    const initRAG = async () => {
      try {
        const assistantRes = await base44.functions.invoke('backboardRAG', {
          action: 'create_assistant',
          name: 'Wildfire AI Assistant',
          system_prompt: 'You are an expert AI assistant for Canadian wildfire safety, emergency response, evacuation procedures, and fire detection. Provide clear, accurate, and concise guidance. When asked about fire detection in images, provide definitive yes/no answers. Always respond in English.'
        });
        const newAssistantId = assistantRes.data.assistant_id;
        setAssistantId(newAssistantId);

        const threadRes = await base44.functions.invoke('backboardRAG', {
          action: 'create_thread',
          assistant_id: newAssistantId
        });
        setThreadId(threadRes.data.thread_id);
        setInitialized(true);
      } catch (error) {
        console.error('RAG init error:', error);
        setInitialized(true); // Still show UI even if init fails
      }
    };
    initRAG();
  }, []);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const speakText = async (text) => {
    if (!voiceEnabled) return;
    setSpeaking(true);
    try {
      const res = await base44.functions.invoke('textToSpeech', {
        text: text.slice(0, 500), // Keep within limits
        voiceId: 'EXAVITQu4vr4xnSDxMaL' // Rachel - clear English voice
      });
      if (res.data?.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${res.data.audio}`);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.play();
      } else {
        setSpeaking(false);
      }
    } catch {
      setSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !threadId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('backboardRAG', {
        action: 'send_message',
        thread_id: threadId,
        content: userMessage
      });

      const assistantContent = response.data.content || 'No response received';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
      speakText(assistantContent);
    } catch (error) {
      const errMsg = 'Sorry, I was unable to get a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
          <p className="text-slate-400">Initializing AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#1a1a2e]/60">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-300">Wildfire AI Assistant</span>
          <span className="text-xs text-slate-500">· Powered by Backboard RAG</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setVoiceEnabled(v => !v); stopSpeaking(); }}
          className={`gap-1 text-xs ${voiceEnabled ? 'text-amber-400' : 'text-slate-500'}`}
        >
          {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          {voiceEnabled ? 'Voice On' : 'Voice Off'}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Brain className="w-12 h-12 text-amber-400 mx-auto opacity-50" />
              <p className="text-slate-300 font-medium">Ask me anything about wildfire safety</p>
              <p className="text-slate-500 text-sm">Evacuation, fire detection, emergency response — I'm here to help.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {["What should I do if I see smoke?", "How do I evacuate safely?", "What are wildfire danger signs?"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}
            <div className={`max-w-xs lg:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-amber-500 text-black font-medium rounded-br-sm'
                : 'bg-white/10 border border-white/10 text-slate-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {speaking && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <Volume2 className="w-3 h-3 animate-pulse" /> Speaking...
              <button onClick={stopSpeaking} className="ml-1 hover:text-white">✕</button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-[#1a1a2e]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            onClick={toggleListening}
            disabled={loading}
            className={`flex-shrink-0 ${listening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400'}`}
            size="icon"
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening..." : "Ask about wildfire safety, fire detection, evacuation..."}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            disabled={loading || listening}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim() || !threadId}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            size="icon"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        {!recognitionRef.current && (
          <p className="text-xs text-slate-600 mt-1 text-center">Voice input not supported in this browser</p>
        )}
      </div>
    </div>
  );
}