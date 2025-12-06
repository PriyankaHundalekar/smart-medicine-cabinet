import React, { useState, useEffect, useRef } from 'react';
import { MedicineData, HistoryItem } from '../types';
import { checkInteractions, createPharmacistChat } from '../services/geminiService';
import { 
  AlertTriangle, CheckCircle, Clock, Info, ShieldAlert, 
  ArrowLeft, Save, MessageCircle, Send, XCircle, ChevronRight, Pill
} from 'lucide-react';

interface ResultCardProps {
  data: MedicineData;
  imageUrl?: string;
  onBack: () => void;
  onSave: () => void;
  isSaved: boolean;
  history: HistoryItem[];
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, imageUrl, onBack, onSave, isSaved, history }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  
  // Interaction State
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: `Hi! I'm your AI Pharmacist. Ask me anything about ${data.medicineName}.` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat & Check Interactions
  useEffect(() => {
    chatSessionRef.current = createPharmacistChat(data);
    
    const check = async () => {
      const cabinetNames = history
        .map(h => h.medicineName)
        .filter(name => name.toLowerCase() !== data.medicineName.toLowerCase());

      if (cabinetNames.length > 0) {
        setCheckingInteractions(true);
        const result = await checkInteractions(data.medicineName, cabinetNames);
        setInteractionResult(result);
        setCheckingInteractions(false);
      }
    };
    check();
  }, [data, history]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isChatLoading) return;
    
    const userMsg = inputText;
    setInputText('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      setChatMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const checkExpiryStatus = (dateStr: string | null) => {
    if (!dateStr) return { status: 'unknown', color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock, label: 'No Date Found' };
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearMatch = dateStr.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year < currentYear) return { status: 'expired', color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertTriangle, label: 'Expired' };
      if (year === currentYear) return { status: 'check', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle, label: 'Check Month' };
    }
    return { status: 'valid', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, label: 'Likely Valid' };
  };

  const expiryStatus = checkExpiryStatus(data.expiryDate);
  const StatusIcon = expiryStatus.icon;

  return (
    <div className="pb-safe animate-fade-in flex flex-col h-full bg-gray-50 relative">
      
      {/* Header Image Area */}
      <div className="relative h-64 w-full bg-gray-900 flex-shrink-0 group">
        {imageUrl ? (
          <img src={imageUrl} alt="Medicine" className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-gray-400 font-medium">No Image Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between items-start">
          <button onClick={onBack} className="p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                <Pill className="w-3 h-3" /> Medicine Detected
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1 leading-tight tracking-tight shadow-sm">{data.medicineName}</h1>
            {data.dosage && <span className="text-white/80 font-medium text-lg">{data.dosage}</span>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm rounded-t-3xl -mt-4 relative flex-shrink-0 overflow-hidden">
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'details' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Info className="w-4 h-4" />
          Analysis
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'chat' ? 'text-violet-600 bg-violet-50/50 border-b-2 border-violet-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Pharmacist Chat
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#f8fafc]">
        
        {activeTab === 'details' ? (
          <div className="h-full overflow-y-auto p-6 pb-24">
            <div className="space-y-6">
              
              {/* Interaction Alert */}
              {checkingInteractions && (
                 <div className="p-4 bg-white rounded-xl border border-blue-100 flex items-center gap-3 animate-pulse shadow-sm">
                   <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-sm font-medium text-gray-600">Analyzing cabinet interactions...</span>
                 </div>
              )}
              
              {!checkingInteractions && interactionResult?.hasInteraction && (
                 <div className={`p-5 rounded-2xl border flex gap-4 shadow-sm ${
                   interactionResult.severity === 'SEVERE' 
                   ? 'bg-rose-50 border-rose-200 text-rose-900' 
                   : 'bg-amber-50 border-amber-200 text-amber-900'
                 }`}>
                   <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-1" />
                   <div>
                     <h4 className="font-bold text-base mb-1">{interactionResult.alertTitle}</h4>
                     <p className="text-sm leading-relaxed opacity-90">{interactionResult.details}</p>
                   </div>
                 </div>
              )}

              {!checkingInteractions && !interactionResult?.hasInteraction && history.length > 0 && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 text-emerald-800 shadow-sm">
                      <div className="bg-emerald-100 p-1.5 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">Safe to use with your current cabinet.</span>
                  </div>
              )}

              {/* Expiry Badge */}
              <div className={`flex items-center gap-4 p-5 rounded-2xl ${expiryStatus.bg} border border-opacity-60 shadow-sm`}>
                <div className={`p-2 rounded-full bg-white/60 ${expiryStatus.color}`}>
                   <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider opacity-80 ${expiryStatus.color}`}>Expiry Status</p>
                  <p className={`font-bold text-lg ${expiryStatus.color}`}>
                    {data.expiryDate || "Date not visible"}
                  </p>
                </div>
              </div>

              {/* Primary Uses - Indigo Theme */}
              <section className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="font-bold text-lg text-indigo-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <Info className="w-4 h-4" /> 
                  </div>
                  Primary Uses
                </h3>
                <ul className="space-y-3">
                  {data.primaryUses.map((use, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0 shadow-sm shadow-indigo-200" />
                      <span className="leading-relaxed text-sm font-medium">{use}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Warnings - Rose Theme */}
              <section className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
                <h3 className="font-bold text-lg text-rose-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                    <AlertTriangle className="w-4 h-4" /> 
                  </div>
                  Safety Warnings
                </h3>
                <div className="bg-rose-50/50 p-4 rounded-xl text-sm text-gray-800 leading-relaxed border border-rose-100 mb-4">
                    <strong className="text-rose-700">Crucial:</strong> {data.warnings}
                </div>
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Common Side Effects</h4>
                   <div className="flex flex-wrap gap-2">
                    {data.sideEffects.map((effect, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                        {effect}
                        </span>
                    ))}
                   </div>
                </div>
              </section>

              <button 
                onClick={onSave}
                disabled={isSaved}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  isSaved 
                    ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Saved to Cabinet
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save to Medicine Cabinet
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                   {msg.role === 'model' && (
                       <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-violet-600 flex-shrink-0 mr-2 mt-1 shadow-sm">
                           <Pill className="w-4 h-4" />
                       </div>
                   )}
                   <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                     msg.role === 'user' 
                       ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none shadow-violet-500/20' 
                       : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {isChatLoading && (
                 <div className="flex justify-start items-center gap-2 pl-2">
                   <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-violet-600 shadow-sm">
                       <Pill className="w-4 h-4" />
                   </div>
                   <div className="bg-white rounded-2xl p-4 rounded-bl-none flex gap-2 border border-gray-100 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="flex-shrink-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
               <div className="relative">
                 <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask e.g., 'Can I take with food?'"
                    className="w-full bg-gray-50 border-gray-200 border rounded-full py-4 pl-5 pr-14 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm font-medium shadow-inner"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={!inputText.trim() || isChatLoading}
                   className="absolute right-1.5 top-1.5 p-2.5 bg-violet-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-all hover:bg-violet-700 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/30"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">AI can make mistakes. Consult a doctor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};