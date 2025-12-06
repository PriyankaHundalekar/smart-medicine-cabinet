import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, HeartPulse } from 'lucide-react';
import { createHealthAssistantChat } from '../services/geminiService';

interface HealthChatProps {
  savedMessages?: { role: 'user' | 'model', text: string }[];
  onUpdateMessages?: (messages: { role: 'user' | 'model', text: string }[]) => void;
}

export const HealthChat: React.FC<HealthChatProps> = ({ savedMessages, onUpdateMessages }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>(
    savedMessages || [
      { role: 'model', text: "Hello! I'm your MediScan Health Assistant. I can help you understand symptoms or general health information. How can I help today?" }
    ]
  );
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createHealthAssistantChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (onUpdateMessages) {
      onUpdateMessages(messages);
    }
  }, [messages, onUpdateMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl max-w-4xl mx-auto w-full shadow-2xl rounded-3xl overflow-hidden border border-white/60 ring-1 ring-white/50">
      
      {/* Header - Teal Theme */}
      <div className="bg-white/80 p-5 border-b border-teal-100 flex items-center gap-4 flex-shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 opacity-50"></div>
        <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            Health Assistant
            <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          </h2>
          <p className="text-xs text-gray-500 font-medium">Wellness & Symptom Check</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-white border border-teal-100 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-br-none shadow-teal-500/20' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-gray-200/50'
            }`}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
               <div className="w-8 h-8 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0 mt-1">
                 <User className="w-5 h-5" />
               </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 bg-white border border-teal-100 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
             <div className="bg-white rounded-2xl p-4 rounded-tl-none border border-gray-100 shadow-sm flex gap-2 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-100 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 max-w-3xl mx-auto relative">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe your symptoms or ask a question..."
            className="flex-grow bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400 shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">Always consult a doctor. AI is for info only.</p>
      </div>
    </div>
  );
};