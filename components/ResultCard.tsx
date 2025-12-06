import React, { useState, useEffect, useRef } from 'react';
import { MedicineData, HistoryItem } from '../types';
import { checkInteractions, createPharmacistChat } from '../services/geminiService';
import { 
  AlertTriangle, CheckCircle, Clock, Info, ShieldAlert, 
  ArrowLeft, Save, MessageCircle, Send, XCircle 
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
      // Don't check against itself if it's already in history and we are viewing it
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
      if (year < currentYear) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Expired' };
      if (year === currentYear) return { status: 'check', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle, label: 'Check Month' };
    }
    return { status: 'valid', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Likely Valid' };
  };

  const expiryStatus = checkExpiryStatus(data.expiryDate);
  const StatusIcon = expiryStatus.icon;

  return (
    <div className="pb-safe animate-fade-in flex flex-col h-full bg-gray-50 relative">
      
      {/* Header Image Area */}
      <div className="relative h-64 w-full bg-gray-900 flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt="Medicine" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-3xl font-bold text-white mb-1">{data.medicineName}</h1>
            {data.dosage && <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium">{data.dosage}</span>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm rounded-t-3xl -mt-4 relative">
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          <Info className="w-4 h-4" />
          Details
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          <MessageCircle className="w-4 h-4" />
          Ask Pharmacist
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto bg-white p-6 pb-24">
        
        {activeTab === 'details' ? (
          <div className="space-y-6">
            
            {/* Interaction Alert */}
            {checkingInteractions && (
               <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 animate-pulse">
                 <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm text-gray-500">Checking for interactions with your cabinet...</span>
               </div>
            )}
            
            {!checkingInteractions && interactionResult?.hasInteraction && (
               <div className={`p-4 rounded-xl border flex gap-3 ${interactionResult.severity === 'SEVERE' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                 <XCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-sm mb-1">{interactionResult.alertTitle}</h4>
                   <p className="text-sm leading-tight opacity-90">{interactionResult.details}</p>
                 </div>
               </div>
            )}

            {!checkingInteractions && !interactionResult?.hasInteraction && history.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Safe to use with your current cabinet.</span>
                </div>
            )}

            {/* Expiry Badge */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ${expiryStatus.bg} border border-opacity-50`}>
              <StatusIcon className={`w-6 h-6 ${expiryStatus.color}`} />
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${expiryStatus.color}`}>Expiry Status</p>
                <p className={`font-semibold ${expiryStatus.color}`}>
                  {data.expiryDate || "Date not visible"} {data.expiryDate && `(${expiryStatus.label})`}
                </p>
              </div>
            </div>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" /> Primary Uses
              </h3>
              <ul className="space-y-2">
                {data.primaryUses.map((use, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed text-sm font-medium">{use}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" /> Warnings
              </h3>
              <div className="bg-orange-50 p-4 rounded-xl text-sm text-gray-800 leading-relaxed border border-orange-100 mb-4">
                  <strong>Note:</strong> {data.warnings}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.sideEffects.map((effect, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                    {effect}
                  </span>
                ))}
              </div>
            </section>

            <button 
              onClick={onSave}
              disabled={isSaved}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isSaved 
                  ? 'bg-green-100 text-green-700 cursor-default' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'
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
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow space-y-4 pb-4">
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                     msg.role === 'user' 
                       ? 'bg-blue-600 text-white rounded-br-none' 
                       : 'bg-gray-100 text-gray-800 rounded-bl-none'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {isChatLoading && (
                 <div className="flex justify-start">
                   <div className="bg-gray-100 rounded-2xl p-4 rounded-bl-none flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>
            
            <div className="sticky bottom-0 bg-white pt-2">
               <div className="relative">
                 <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask e.g., 'Can I take with food?'"
                    className="w-full bg-gray-100 border-none rounded-full py-3.5 pl-5 pr-12 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={!inputText.trim() || isChatLoading}
                   className="absolute right-1.5 top-1.5 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-[10px] text-gray-400 text-center mt-2">AI can make mistakes. Consult a doctor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};