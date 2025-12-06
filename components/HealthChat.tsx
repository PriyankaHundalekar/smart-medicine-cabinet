import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Sparkles } from 'lucide-react';
import { createHealthAssistantChat } from '../services/geminiService';

interface HealthChatProps {
  // We can pass existing chat state if we want to persist it across tab switches in the parent
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
    // Initialize session
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
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl max-w-4xl mx-auto w-full shadow-2xl rounded-3xl overflow-hidden border border-white/60">
      <div className="bg-white/90 p-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Bot className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            Health Assistant
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-xs text-gray-500 font-medium">Always consult a doctor for medical advice.</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-white/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/20' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100/50 shadow-gray-200/50'
            }`}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
               <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0 mt-1">
                 <User className="w-5 h-5" />
               </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
             <div className="bg-white rounded-2xl p-4 rounded-tl-none border border-gray-100/50 shadow-sm flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/90 p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe your symptoms..."
            className="flex-grow bg-gray-100/80 border-transparent rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};