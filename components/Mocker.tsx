
import React from 'react';

interface MockerProps {
  phrase: string;
  onRetry: () => void;
}

const Mocker: React.FC<MockerProps> = ({ phrase, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-950 p-6">
      <div className="max-w-xl w-full bg-slate-900 border-4 border-red-600 rounded-none p-12 text-center shadow-[20px_20px_0px_0px_rgba(220,38,38,0.5)]">
        <div className="mb-8">
          <i className="fas fa-skull-crossbones text-8xl text-red-500 animate-pulse"></i>
        </div>
        <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter italic">
          Master Builder Rejection
        </h1>
        <p className="text-xl font-mono text-red-400 mb-10 leading-relaxed bg-red-900/20 p-4 border border-red-500/30">
          "{phrase}"
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
        >
          I am sorry. Let me out.
        </button>
      </div>
    </div>
  );
};

export default Mocker;
