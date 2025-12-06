import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import { HealthChat } from './components/HealthChat';
import { AppView, MedicineData, HistoryItem } from './types';
import { Home, Scan, BookOpen, MessageSquare, Plus, Stethoscope, Sparkles, Pill, Activity, FlaskConical, HeartPulse, ArrowRight } from 'lucide-react';

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
          <div className="flex flex-col items-center justify-center min-h-full px-6 text-center animate-fade-in max-w-4xl mx-auto py-8 relative z-10">
            
            {/* Hero Section */}
            <div className="mb-10 mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full mb-6 border border-white/40 shadow-sm ring-1 ring-white/50">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                        AI-Powered Medicine Assistant
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
                  MediScan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">AI</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed font-medium">
                  Your pocket pharmacist. Identify pills instantly, check for interactions, and chat with a health expert.
                </p>
            </div>
            
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-2">
              
              {/* Scan Card */}
              <button 
                onClick={() => setCurrentView(AppView.SCAN)}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Scan className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Scan Medicine</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                        Take a photo of a pill or bottle to get dosage, expiry, and safety details instantly.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                        Start Scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </button>

              {/* Chat Card */}
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">Health Assistant</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                        Chat with our AI to understand symptoms, general health, and wellness advice.
                    </p>
                    <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                        Start Chat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </button>
            </div>

            {/* Quick Info Strips */}
            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-2xl">
               <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30 flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">Check Interactions</h4>
                    <p className="text-xs text-gray-500">Keep your cabinet safe</p>
                  </div>
               </div>
               <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">Track History</h4>
                    <p className="text-xs text-gray-500">Manage your meds</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case AppView.SCAN:
        return (
          <div className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full p-4 z-10 relative">
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden ring-1 ring-white/50">
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
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 h-full overflow-hidden ring-1 ring-white/50">
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
    <div className="relative min-h-screen text-gray-900 font-sans flex flex-col md:flex-row overflow-hidden bg-[#eff3f9]">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft colorful gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-violet-100 via-transparent to-transparent opacity-70"></div>
        
        {/* Animated 3D Floating Icons */}
        <div className="absolute top-[10%] left-[5%] opacity-30 animate-float-slow">
            <Pill className="w-20 h-20 text-blue-400 rotate-12 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-[15%] right-[5%] opacity-30 animate-float-medium">
            <FlaskConical className="w-28 h-28 text-violet-400 -rotate-12 drop-shadow-lg" />
        </div>
        <div className="absolute top-[35%] right-[20%] opacity-20 animate-float-fast">
            <Activity className="w-14 h-14 text-emerald-400 rotate-45" />
        </div>
        <div className="absolute bottom-[8%] left-[15%] opacity-20 animate-float-slow">
            <HeartPulse className="w-16 h-16 text-rose-400 -rotate-6" />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[100px] animate-pulse animation-delay-4000"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-6 z-30 bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-2xl shadow-blue-900/5">
        <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => setCurrentView(AppView.HOME)}>
           <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
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
            colorClass="text-blue-600"
          />
          <SidebarItem 
            icon={<Scan className="w-5 h-5" />} 
            label="Scan Medicine" 
            active={currentView === AppView.SCAN} 
            onClick={() => setCurrentView(AppView.SCAN)} 
            colorClass="text-violet-600"
          />
          <SidebarItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Cabinet History" 
            active={currentView === AppView.HISTORY} 
            onClick={() => setCurrentView(AppView.HISTORY)} 
            colorClass="text-amber-600"
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Health Assistant" 
            active={currentView === AppView.CHAT} 
            onClick={() => setCurrentView(AppView.CHAT)} 
            colorClass="text-emerald-600"
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200/50">
           <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl text-blue-900 border border-blue-100/50 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-blue-700">
                <Sparkles className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Pro Tip</p>
             </div>
             <p className="text-[11px] opacity-80 leading-relaxed font-medium">
               Always verify AI results with the physical label. Your safety is our top priority.
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-4rem)] md:h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth z-10">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/60 py-2 px-6 pb-safe z-40 flex justify-between items-center shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
        <MobileNavItem 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          active={currentView === AppView.HOME} 
          onClick={() => setCurrentView(AppView.HOME)} 
          activeColor="text-blue-600"
        />
        <MobileNavItem 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Cabinet" 
          active={currentView === AppView.HISTORY} 
          onClick={() => setCurrentView(AppView.HISTORY)} 
          activeColor="text-amber-600"
        />
        
        {/* Floating Action Button for Scan */}
        <div className="relative -top-8 group">
          <button 
            onClick={() => setCurrentView(AppView.SCAN)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 hover:scale-105 transition-transform border-[6px] border-[#eff3f9]"
          >
            <Scan className="w-7 h-7" />
          </button>
        </div>

        <MobileNavItem 
          icon={<MessageSquare className="w-6 h-6" />} 
          label="Chat" 
          active={currentView === AppView.CHAT} 
          onClick={() => setCurrentView(AppView.CHAT)} 
          activeColor="text-emerald-600"
        />
        <MobileNavItem 
          icon={<Stethoscope className="w-6 h-6" />} 
          label="Results" 
          active={currentView === AppView.RESULTS} 
          onClick={() => scanResult ? setCurrentView(AppView.RESULTS) : alert('Scan a medicine first')} 
          disabled={!scanResult}
          activeColor="text-violet-600"
        />
      </nav>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float 5s ease-in-out infinite;
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
const SidebarItem = ({ icon, label, active, onClick, colorClass }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-white shadow-md shadow-gray-200/50 font-bold text-gray-900 border border-gray-100' 
        : 'text-gray-500 hover:bg-white/50 hover:text-gray-800 font-medium'
    }`}
  >
    <div className="relative z-10 flex items-center gap-3">
        {React.cloneElement(icon, { className: active ? `w-5 h-5 ${colorClass}` : 'w-5 h-5 group-hover:scale-110 transition-transform' })}
        <span>{label}</span>
    </div>
    {active && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.replace('text-', 'bg-')} rounded-r-full`}></div>}
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick, disabled, activeColor }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
      disabled ? 'opacity-30' : 
      active ? activeColor : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {React.cloneElement(icon, { className: active ? 'w-6 h-6 fill-current drop-shadow-sm' : 'w-6 h-6' })}
    <span className={`text-[10px] tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export default App;