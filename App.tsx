import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import { HealthChat } from './components/HealthChat';
import { AppView, MedicineData, HistoryItem } from './types';
import { Home, Scan, BookOpen, MessageSquare, Plus, Stethoscope, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [scanResult, setScanResult] = useState<MedicineData | null>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Lift chat state to preserve history when switching tabs
  const [healthChatMessages, setHealthChatMessages] = useState<{ role: 'user' | 'model', text: string }[] | undefined>(undefined);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('medicine_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('medicine_history', JSON.stringify(history));
  }, [history]);

  const handleScanComplete = (data: MedicineData, imageUrl: string) => {
    setScanResult(data);
    setCurrentImage(imageUrl);
    setCurrentView(AppView.RESULTS);
  };

  const handleSaveToHistory = () => {
    if (!scanResult) return;
    
    const newItem: HistoryItem = {
      ...scanResult,
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl: currentImage
    };

    setHistory(prev => [newItem, ...prev]);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-full px-6 text-center animate-fade-in max-w-2xl mx-auto py-12 relative z-10">
            {/* Decorative Icon */}
            <div className="w-28 h-28 bg-white/80 backdrop-blur-xl border border-white/50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/10 transform rotate-3 hover:rotate-6 transition-all duration-300">
               <Scan className="w-14 h-14" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full mb-6 border border-white/40 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Powered by Gemini 2.5 AI
                </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
              MediScan <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-12 font-medium">
              Your intelligent medical assistant. Identify pills, check interactions, and get instant health advice.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
              <button 
                onClick={() => setCurrentView(AppView.SCAN)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10"
              >
                <Scan className="w-6 h-6" />
                Scan Medicine
              </button>
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="flex-1 bg-white/80 backdrop-blur-xl text-blue-700 font-bold text-lg py-4 px-8 rounded-2xl shadow-lg border border-white/50 hover:bg-white/90 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-6 h-6" />
                Ask Assistant
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-6 w-full max-w-lg text-left">
               <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 hover:bg-white/80 transition-colors cursor-default">
                  <div className="w-10 h-10 bg-green-100/80 text-green-600 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Instant Info</h3>
                  <p className="text-sm text-gray-500 mt-2">Get dosage & usage details in seconds.</p>
               </div>
               <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 hover:bg-white/80 transition-colors cursor-default">
                  <div className="w-10 h-10 bg-orange-100/80 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Safety First</h3>
                  <p className="text-sm text-gray-500 mt-2">Check warnings, side effects & interactions.</p>
               </div>
            </div>
          </div>
        );
      case AppView.SCAN:
        return (
          <div className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full p-4 z-10 relative">
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <Scanner 
                    onScanComplete={handleScanComplete} 
                    onCancel={() => setCurrentView(AppView.HOME)} 
                />
             </div>
          </div>
        );
      case AppView.RESULTS:
        if (!scanResult) return null;
        const isSaved = history.some(item => 
          item.medicineName === scanResult.medicineName && 
          item.dosage === scanResult.dosage &&
          item.expiryDate === scanResult.expiryDate
        );
        return (
          <div className="h-full max-w-3xl mx-auto w-full md:p-6 z-10 relative">
            <div className="bg-white shadow-2xl overflow-hidden rounded-none md:rounded-3xl h-full md:h-[calc(100vh-5rem)] border md:border-white/50">
                <ResultCard 
                data={scanResult} 
                imageUrl={currentImage}
                onBack={() => setCurrentView(AppView.HOME)} 
                onSave={handleSaveToHistory}
                isSaved={isSaved}
                history={history}
                />
            </div>
          </div>
        );
      case AppView.HISTORY:
        return (
          <div className="h-full max-w-3xl mx-auto w-full p-4 md:p-8 z-10 relative">
             <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 h-full overflow-hidden">
                <HistoryList 
                items={history} 
                onSelect={(item) => {
                    setScanResult(item);
                    setCurrentImage(item.imageUrl);
                    setCurrentView(AppView.RESULTS);
                }}
                onDelete={handleDeleteHistory}
                onScanNew={() => setCurrentView(AppView.SCAN)}
                />
            </div>
          </div>
        );
      case AppView.CHAT:
        return (
          <div className="h-full p-4 md:p-8 flex flex-col items-center z-10 relative">
            <HealthChat 
              savedMessages={healthChatMessages}
              onUpdateMessages={setHealthChatMessages}
            />
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen text-gray-900 font-sans flex flex-col md:flex-row overflow-hidden bg-[#f0f4f8]">
      
      {/* Background Gradient & Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main subtle gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50"></div>
        
        {/* Colorful Orbs */}
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-400/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-purple-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] bg-teal-300/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        
        {/* Texture overlay (optional noise) */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>
      </div>

      {/* Desktop Sidebar (Glassmorphism) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-6 z-30 bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-xl shadow-blue-900/5">
        <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => setCurrentView(AppView.HOME)}>
           <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Scan className="w-6 h-6" />
           </div>
           <span className="font-bold text-2xl tracking-tight text-gray-800">MediScan</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <SidebarItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            active={currentView === AppView.HOME} 
            onClick={() => setCurrentView(AppView.HOME)} 
          />
          <SidebarItem 
            icon={<Scan className="w-5 h-5" />} 
            label="Scan Medicine" 
            active={currentView === AppView.SCAN} 
            onClick={() => setCurrentView(AppView.SCAN)} 
          />
          <SidebarItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Cabinet History" 
            active={currentView === AppView.HISTORY} 
            onClick={() => setCurrentView(AppView.HISTORY)} 
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Health Assistant" 
            active={currentView === AppView.CHAT} 
            onClick={() => setCurrentView(AppView.CHAT)} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200/50">
           <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl text-blue-900 border border-blue-100">
             <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Sparkles className="w-4 h-4" />
                <p className="text-xs font-bold uppercase">Pro Tip</p>
             </div>
             <p className="text-[11px] opacity-90 leading-relaxed font-medium">
               Always verify AI results with the physical label. Your safety is our top priority.
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-4rem)] md:h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth z-10">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation (Glassmorphism) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 py-2 px-6 pb-safe z-40 flex justify-between items-center shadow-[0_-5px_25px_rgba(0,0,0,0.05)]">
        <MobileNavItem 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          active={currentView === AppView.HOME} 
          onClick={() => setCurrentView(AppView.HOME)} 
        />
        <MobileNavItem 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Cabinet" 
          active={currentView === AppView.HISTORY} 
          onClick={() => setCurrentView(AppView.HISTORY)} 
        />
        
        {/* Floating Action Button for Scan */}
        <div className="relative -top-8">
          <button 
            onClick={() => setCurrentView(AppView.SCAN)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 hover:scale-105 transition-transform border-[6px] border-[#f4f7fb]"
          >
            <Scan className="w-7 h-7" />
          </button>
        </div>

        <MobileNavItem 
          icon={<MessageSquare className="w-6 h-6" />} 
          label="Chat" 
          active={currentView === AppView.CHAT} 
          onClick={() => setCurrentView(AppView.CHAT)} 
        />
        <MobileNavItem 
          icon={<Stethoscope className="w-6 h-6" />} 
          label="Results" 
          active={currentView === AppView.RESULTS} 
          onClick={() => scanResult ? setCurrentView(AppView.RESULTS) : alert('Scan a medicine first')} 
          disabled={!scanResult}
        />
      </nav>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

// Helper Components for Nav
const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold' 
        : 'text-gray-600 hover:bg-white/50 hover:text-blue-700 font-medium'
    }`}
  >
    <div className="relative z-10 flex items-center gap-3">
        {React.cloneElement(icon, { className: active ? 'w-5 h-5' : 'w-5 h-5 group-hover:scale-110 transition-transform' })}
        <span>{label}</span>
    </div>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
      disabled ? 'opacity-30' : 
      active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {React.cloneElement(icon, { className: active ? 'w-6 h-6 fill-current drop-shadow-sm' : 'w-6 h-6' })}
    <span className={`text-[10px] tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export default App;