import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Brain } from "lucide-react";

export default function RAGChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize assistant and thread on mount
  useEffect(() => {
    const initRAG = async () => {
      try {
        // Create assistant
        const assistantRes = await base44.functions.invoke('backboardRAG', {
          action: 'create_assistant',
          name: 'Wildfire Knowledge',
          system_prompt: 'You are an expert on Canadian wildfires, emergency response, and evacuation procedures. Provide accurate, actionable guidance.'
        });

        const newAssistantId = assistantRes.data.assistant_id;
        setAssistantId(newAssistantId);

        // Create thread
        const threadRes = await base44.functions.invoke('backboardRAG', {
          action: 'create_thread',
          assistant_id: newAssistantId
        });

        setThreadId(threadRes.data.thread_id);
        setInitialized(true);
      } catch (error) {
        console.error('RAG initialization error:', error);
      }
    };

    initRAG();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.content || 'No response received'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Unable to get response. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
          <p className="text-slate-400">Initializing knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f1a]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">Ask anything about wildfire safety and emergency response</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-amber-500 text-black font-medium'
                : 'bg-white/10 border border-white/20 text-slate-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#1a1a2e]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about wildfire safety, evacuation, or emergency response..."
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}