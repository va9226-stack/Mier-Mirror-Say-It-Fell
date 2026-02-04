
import React, { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY, USER_KEY, TIER_KEY, MOCKING_PHRASES } from './constants';
import { Snapshot, BuilderStatus, UserTier } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Mocker from './components/Mocker';
import Subscription from './components/Subscription';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem(USER_KEY));
  const [userTier, setUserTier] = useState<UserTier>((localStorage.getItem(TIER_KEY) as UserTier) || null);
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeSnapshot, setActiveSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<BuilderStatus>(BuilderStatus.IDLE);
  
  // PWA Installation State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showMacInstructions, setShowMacInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if already installed (Standalone Mode)
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!checkStandalone);

    // 2. Detect Device Type
    const ua = navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isMacDevice = /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua) && !isIosDevice;
    const isChromeBrowser = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    
    setIsIOS(isIosDevice);
    setIsMac(isMacDevice);
    setIsChrome(isChromeBrowser);

    // 3. Listen for Android/Chrome Install Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log("Install prompt captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      // Chrome/Edge/Android - Native Prompt
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
            setInstallPrompt(null);
        }
      });
    } else if (isIOS) {
      // iPhone/iPad - Manual Instructions
      setShowIOSInstructions(true);
    } else if (isMac) {
      // macOS (Safari or Chrome fallback) - Manual Instructions
      setShowMacInstructions(true);
    } else {
      // Fallback
      alert("To install: Check your browser menu for 'Install App' or 'Add to Home Screen'");
    }
  };

  // Persistence logic for Snapshots
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSnapshots(JSON.parse(saved));
    }
  }, []);

  const persistSnapshots = useCallback((newSnapshots: Snapshot[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshots));
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem(USER_KEY, email);
    setUserEmail(email);
  };

  const handleSubscription = (tier: UserTier) => {
    localStorage.setItem(TIER_KEY, tier || 'STANDARD');
    setUserTier(tier);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TIER_KEY);
    setUserEmail(null);
    setUserTier(null);
  };

  const addSnapshot = (snapshot: Snapshot) => {
    const updated = [snapshot, ...snapshots];
    setSnapshots(updated);
    persistSnapshots(updated);
    setActiveSnapshot(snapshot);
  };

  const deleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    persistSnapshots(updated);
    if (activeSnapshot?.id === id) setActiveSnapshot(null);
  };

  // 1. Check Login
  if (!userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Check Subscription
  if (!userTier) {
    return <Subscription onSubscribe={handleSubscription} />;
  }

  // 3. Fallback Mocker
  if (status === BuilderStatus.MOCKING) {
    return <Mocker phrase={MOCKING_PHRASES[0]} onRetry={handleLogout} />;
  }

  // 4. Main App
  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden relative pt-safe">
      <Sidebar 
        snapshots={snapshots} 
        activeId={activeSnapshot?.id} 
        onSelect={setActiveSnapshot}
        onDelete={deleteSnapshot}
        onNew={() => setActiveSnapshot(null)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          userEmail={userEmail} 
          userTier={userTier} 
          onLogout={handleLogout} 
          // Show button if NOT installed AND (Prompt exists OR iOS OR Mac)
          // On Mac Chrome, if prompt doesn't fire, we still show button to open manual instructions
          onInstall={(!isStandalone && (installPrompt || isIOS || isMac)) ? handleInstallClick : undefined}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-safe">
          <Dashboard 
            activeSnapshot={activeSnapshot} 
            onSave={addSnapshot}
            status={status}
            setStatus={setStatus}
            userTier={userTier}
          />
        </main>
      </div>

      {/* iOS Manual Install Modal */}
      {showIOSInstructions && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 shadow-2xl relative mb-safe md:mb-0">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center border border-slate-700 shadow-inner">
                <i className="fab fa-apple text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white">iOS Protocol</h3>
              <p className="text-sm text-slate-400 font-mono">
                Apple Security prevents automated installation. Execute manually:
              </p>
              
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-left space-y-3 text-sm font-mono text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">1</span>
                  <span>Tap the <i className="fas fa-share-from-square mx-1"></i> Share button</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">2</span>
                  <span>Select <span className="text-white font-bold">"Add to Home Screen"</span></span>
                </div>
              </div>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* macOS Manual Install Modal */}
      {showMacInstructions && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowMacInstructions(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center border border-slate-700 shadow-inner">
                {isChrome ? (
                   <i className="fab fa-chrome text-4xl text-white"></i>
                ) : (
                   <i className="fas fa-desktop text-4xl text-white"></i>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white">macOS Protocol</h3>
                <div className="mt-2 flex items-center justify-center gap-2 text-green-400">
                     <i className="fas fa-shield-halved text-[10px]"></i>
                     <span className="text-[10px] font-mono uppercase tracking-wider">No Sudo/Root Required</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {isChrome 
                    ? "Install Mier Mirror via Chrome User-Space."
                    : "Install Mier Mirror to your Dock for a native experience."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                {/* Safari Instructions - Only show if NOT Chrome */}
                {!isChrome && (
                    <div className="bg-slate-950 p-4 border border-slate-800/50 hover:border-blue-500/30 transition-colors group">
                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                            <i className="fab fa-safari"></i> Safari
                        </div>
                        <p className="text-sm text-slate-300 font-mono">
                            File <i className="fas fa-chevron-right text-[10px] mx-1"></i> Add to Dock...
                        </p>
                    </div>
                )}

                {/* Chrome Instructions - Highlight if Chrome */}
                {isChrome && (
                    <div className="bg-slate-950 p-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-colors group">
                        <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                            <i className="fab fa-chrome"></i> Chrome Detected
                        </div>
                        <p className="text-sm text-slate-300 font-mono mb-2">
                            The automated prompt was blocked. Use the manual override:
                        </p>
                         <ul className="text-xs text-slate-400 font-mono space-y-2 pl-2">
                            <li>1. Look for the <i className="fas fa-download mx-1 text-white"></i> icon in the URL bar.</li>
                            <li>2. OR: Click <i className="fas fa-ellipsis-vertical mx-1 text-white"></i> (Three Dots) <i className="fas fa-arrow-right mx-1"></i> "Cast, Save and Share" <i className="fas fa-arrow-right mx-1"></i> "Install Mier Mirror..."</li>
                        </ul>
                    </div>
                )}
              </div>

              <button 
                onClick={() => setShowMacInstructions(false)}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
