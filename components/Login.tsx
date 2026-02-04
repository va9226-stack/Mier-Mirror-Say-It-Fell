
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      // Simulate network request to Auth provider
      setTimeout(() => {
        onLogin(email);
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Background Ambience - Deep Space */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#020617_100%)] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10 perspective-1000">
        <div className="mb-12 text-center transform transition-all hover:scale-105 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-slate-900 border border-slate-800 shadow-[0_0_40px_rgba(255,255,255,0.05)] relative group">
            <div className="absolute inset-0 rounded-full border border-white/10 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-700"></div>
            <i className="fas fa-diamond text-3xl text-slate-200 group-hover:text-white transition-colors"></i>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase drop-shadow-2xl">Mier Mirror Say It Fell</h1>
          <p className="text-[10px] font-mono text-slate-500 tracking-[0.5em] uppercase pl-1">Sovereign Architecture</p>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden group">
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-scan"></div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Identity
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 text-white px-4 py-4 focus:outline-none focus:border-slate-500 focus:bg-slate-900 transition-all font-mono text-sm placeholder:text-slate-800"
                  placeholder="USR-ID.001"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <i className="fas fa-fingerprint absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"></i>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Passkey
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 text-white px-4 py-4 focus:outline-none focus:border-slate-500 focus:bg-slate-900 transition-all font-mono text-sm placeholder:text-slate-800"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i className="fas fa-key absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"></i>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-3 w-3 rounded border-slate-700 bg-slate-900 text-white focus:ring-offset-0 focus:ring-0" />
                <label htmlFor="remember-me" className="ml-2 block text-[10px] text-slate-500 font-mono">PERSIST</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-mono text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-tight">
                  Lost Credentials?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-white text-black font-bold py-4 uppercase tracking-widest transition-all text-xs border border-transparent hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Initialize Session <i className="fas fa-arrow-right ml-1"></i>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center flex justify-center gap-4 text-[10px] text-slate-600 font-mono">
          <span>SECURE ENCLAVE</span>
          <span>•</span>
          <span>AES-256</span>
          <span>•</span>
          <span>V.2.7.0</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
