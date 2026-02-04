
import React from 'react';
import { UserTier } from '../types';

interface HeaderProps {
  userEmail: string;
  userTier: UserTier;
  onLogout: () => void;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, userTier, onLogout, onInstall }) => {
  return (
    <header className="h-16 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 relative">
      
      <div className="flex items-center gap-4 z-10">
        <div className="lg:hidden text-2xl font-black tracking-tighter text-white">MM</div>
        <div className="h-4 w-px bg-slate-800 hidden lg:block mx-2"></div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sovereign Operator</span>
          <span className="text-sm font-mono text-slate-200">{userEmail}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 z-10">
        
        {/* Install App Button (PWA) */}
        {onInstall && (
          <button
            onClick={onInstall}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all animate-pulse"
          >
            <i className="fas fa-download text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Install Protocol</span>
          </button>
        )}

        {userTier && (
           <div className={`hidden md:flex items-center gap-2 px-3 py-1 border ${
             userTier === 'ADVANCED' 
             ? 'bg-amber-900/20 border-amber-500/30 text-amber-500' 
             : 'bg-slate-800 border-slate-700 text-slate-400'
           }`}>
             {userTier === 'ADVANCED' && <i className="fas fa-crown text-xs"></i>}
             <span className="text-[10px] font-black uppercase tracking-widest">
               {userTier} Tier
             </span>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className="p-2 hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
          title="Disconnect"
        >
          <i className="fas fa-power-off"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
