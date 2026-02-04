
import React, { useState, useEffect, useRef } from 'react';
import { Snapshot, BuilderStatus, UserTier } from '../types';
import { gemini } from '../services/geminiService';
import MierMirror from './MierMirror';

interface DashboardProps {
  activeSnapshot: Snapshot | null;
  onSave: (s: Snapshot) => void;
  status: BuilderStatus;
  setStatus: (s: BuilderStatus) => void;
  userTier: UserTier;
}

const Dashboard: React.FC<DashboardProps> = ({ activeSnapshot, onSave, status, setStatus, userTier }) => {
  const [prompt, setPrompt] = useState('');
  const [genType, setGenType] = useState<'text' | 'image' | 'code'>('text');
  // Logic: Can only be isAdvanced if userTier is ADVANCED.
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRitualActive, setIsRitualActive] = useState(false);
  
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Force reset advanced mode if user tier is standard
  useEffect(() => {
    if (userTier === 'STANDARD') {
      setIsAdvanced(false);
    } else if (userTier === 'ADVANCED') {
        setIsAdvanced(true); // Default to advanced for high payers
    }
  }, [userTier]);

  useEffect(() => {
    if (activeSnapshot) {
      setPrompt(activeSnapshot.prompt);
      setGenType(activeSnapshot.type);
    } else {
      setPrompt('');
      setErrorMessage(null);
    }
  }, [activeSnapshot]);

  const stopAudio = () => {
    if (audioSource) {
      try { audioSource.stop(); } catch (e) {}
      setAudioSource(null);
    }
    setIsRitualActive(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    stopAudio();
    
    setStatus(BuilderStatus.BUILDING);
    setErrorMessage(null);
    
    try {
      let content = "";
      if (genType === 'image') {
        const url = await gemini.generateImage(prompt);
        if (!url) throw new Error("Image builder failed.");
        content = url;
      } else {
        const sys = genType === 'code' 
          ? "You are an elite software engineer. Output ONLY valid, performant, and commented code. No conversational fluff."
          : "You are a master storyteller and strategist. Be precise, creative, and authoritative.";
        
        // Pass isAdvanced to service
        content = await gemini.generateSnapshot(prompt, sys, isAdvanced);
      }

      const newSnapshot: Snapshot = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        prompt,
        content,
        type: genType,
        metadata: { isAdvanced }
      };

      onSave(newSnapshot);
      setStatus(BuilderStatus.IDLE);
    } catch (err: any) {
      console.error(err);
      setStatus(BuilderStatus.ERROR);
      setErrorMessage(err.message || "Mier Mirror Say It Fell execution failed.");
    }
  };

  const handleRitual = async () => {
    if (!activeSnapshot) return;
    stopAudio();
    setIsRitualActive(true);

    try {
      const audioBuffer = await gemini.performPurificationRitual(activeSnapshot.content);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsRitualActive(false);
      source.start(0);
      setAudioSource(source);

    } catch (err: any) {
      console.error(err);
      setErrorMessage("The Ritual was interrupted.");
      setIsRitualActive(false);
    }
  };

  const handleDownload = () => {
    if (!activeSnapshot) return;
    const link = document.createElement('a');
    if (activeSnapshot.type === 'image') {
      link.href = activeSnapshot.content;
      link.download = `mier-visual-${activeSnapshot.timestamp}.png`;
    } else {
      const blob = new Blob([activeSnapshot.content], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
      link.download = `mier-construct-${activeSnapshot.timestamp}.${activeSnapshot.type === 'code' ? 'tsx' : 'txt'}`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isBuilding = status === BuilderStatus.BUILDING;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Input Section */}
      <section className="relative group rounded-none p-[1px] bg-gradient-to-b from-slate-800 to-black shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-r ${isAdvanced ? 'from-amber-500/20 via-yellow-500/20 to-amber-500/20' : 'from-slate-700 via-slate-600 to-slate-700'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl`}></div>
        
        <div className="bg-[#020617] p-6 relative overflow-hidden border border-slate-800">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex bg-slate-900 p-1 border border-slate-800">
              {(['text', 'code', 'image'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGenType(t)}
                  disabled={isBuilding}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    genType === t 
                      ? 'bg-white text-black' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isAdvanced ? 'text-amber-400' : 'text-slate-600'}`}>
                {isAdvanced ? 'Advanced Mode (Pro)' : 'Standard Mode (Flash)'}
              </span>
              
              {/* Toggle Logic */}
              <button
                onClick={() => userTier === 'ADVANCED' && setIsAdvanced(!isAdvanced)}
                disabled={isBuilding || genType === 'image' || userTier === 'STANDARD'}
                className={`relative w-12 h-6 transition-colors border ${
                  userTier === 'STANDARD' ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-900' : 
                  isAdvanced 
                    ? 'bg-amber-900/20 border-amber-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
                title={userTier === 'STANDARD' ? "Upgrade to Advanced to unlock" : "Toggle Intelligence"}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 shadow-md transition-transform duration-300 ${
                  isAdvanced 
                    ? 'translate-x-6 bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
                    : 'translate-x-0.5 bg-slate-500'
                }`}></div>
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isBuilding}
              placeholder="Input parameters for Mier Mirror Say It Fell..."
              className="w-full h-40 bg-transparent text-lg text-white placeholder:text-slate-700 outline-none resize-none font-medium leading-relaxed font-mono"
            />
          </div>

          {/* Action Bar */}
          <div className="flex justify-end border-t border-slate-800 pt-4">
            <button
              onClick={handleGenerate}
              disabled={isBuilding || !prompt.trim()}
              className={`px-8 py-3 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
                isBuilding 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : isAdvanced
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-white hover:bg-slate-200 text-black'
              }`}
            >
              {isBuilding ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  {isAdvanced ? 'Thinking...' : 'Building...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isAdvanced ? 'fa-brain' : 'fa-bolt'}`}></i>
                  {isAdvanced ? 'Execute (Advanced)' : 'Execute'}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-950/20 border border-red-900 p-4 flex gap-4 items-start animate-in slide-in-from-top-2">
          <i className="fas fa-triangle-exclamation text-red-500 mt-1"></i>
          <div>
            <h4 className="font-bold text-red-500 text-sm mb-1 uppercase tracking-widest">Failure</h4>
            <p className="text-xs text-red-400 font-mono leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Content Section */}
      {(activeSnapshot || isBuilding) && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <i className="fas fa-layer-group"></i>
              {isBuilding ? 'Synthesizing...' : 'Output'}
            </h3>
            
            <div className="flex items-center gap-2">
              {activeSnapshot && genType !== 'image' && (
                <button
                  onClick={handleRitual}
                  disabled={isRitualActive}
                  className={`flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${
                    isRitualActive 
                      ? 'bg-purple-900/50 border-purple-500 text-white animate-pulse' 
                      : 'bg-slate-900 border-slate-700 text-purple-400 hover:border-purple-500 hover:text-purple-300'
                  }`}
                >
                  <i className={`fas ${isRitualActive ? 'fa-volume-high' : 'fa-wand-magic-sparkles'}`}></i>
                  {isRitualActive ? 'Ritual Active...' : 'Purify'}
                </button>
              )}
              
              {activeSnapshot?.metadata?.isAdvanced && (
                <span className="text-[10px] font-bold text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">
                  ADVANCED
                </span>
              )}
            </div>
          </div>

          <div className={`bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden min-h-[500px] relative group transition-all duration-500 ${isRitualActive ? 'shadow-[0_0_50px_rgba(168,85,247,0.1)] border-purple-900' : ''}`}>
            
            {/* Loading State */}
            {isBuilding && (
              <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center gap-8">
                <div className="relative w-24 h-24">
                  <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${isAdvanced ? 'border-amber-500/30 border-t-amber-500' : 'border-slate-500/30 border-t-white'}`}></div>
                  <div className={`absolute inset-4 rounded-full border-2 border-b-transparent animate-spin-reverse ${isAdvanced ? 'border-amber-500/20 border-b-amber-500' : 'border-slate-500/20 border-b-slate-400'}`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`fas ${genType === 'code' ? 'fa-code' : genType === 'image' ? 'fa-image' : 'fa-align-left'} text-xl ${isAdvanced ? 'text-amber-500' : 'text-white'} animate-pulse`}></i>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className={`text-sm font-black tracking-[0.3em] uppercase ${isAdvanced ? 'text-amber-500' : 'text-white'} animate-pulse`}>
                    {isAdvanced ? 'Deep Reasoning' : 'Processing'}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    {isAdvanced ? 'Allocating 16k tokens...' : 'Compiling...'}
                  </p>
                </div>
              </div>
            )}

            {/* Content Display */}
            {activeSnapshot && !isBuilding && (
              <div className="h-full">
                {activeSnapshot.type === 'image' ? (
                  <div className="flex items-center justify-center min-h-[500px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-950 p-10">
                    <img 
                      src={activeSnapshot.content} 
                      alt="Generated Artifact" 
                      className="max-w-full max-h-[70vh] shadow-2xl ring-1 ring-white/10"
                    />
                  </div>
                ) : activeSnapshot.type === 'text' ? (
                  <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <MierMirror question={activeSnapshot.prompt} answer={activeSnapshot.content} />
                  </div>
                ) : (
                  // Default/Code View
                  <div className="relative h-full">
                    <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
                       <button 
                        onClick={handleDownload}
                        className="p-2 bg-slate-800/80 backdrop-blur hover:bg-white hover:text-black text-slate-400 transition-all border border-slate-700 shadow-lg"
                        title="Download Artifact"
                      >
                         <i className="fas fa-file-arrow-down"></i>
                      </button>
                       <button 
                        onClick={() => navigator.clipboard.writeText(activeSnapshot.content)}
                        className="p-2 bg-slate-800/80 backdrop-blur hover:bg-white hover:text-black text-slate-400 transition-all border border-slate-700 shadow-lg"
                        title="Copy to Clipboard"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>

                    <div className="overflow-auto max-h-[80vh] custom-scrollbar p-8">
                      <pre className="font-mono text-sm leading-relaxed text-blue-100">
                        <code>{activeSnapshot.content}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {!activeSnapshot && !isBuilding && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-800 select-none">
          <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
             <i className="fas fa-cube text-4xl opacity-20 text-slate-600"></i>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">Mier Mirror Idle</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
