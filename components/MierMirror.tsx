import React, { useState, useEffect, useRef } from "react";

interface MierMirrorProps {
  question: string;
  answer: string;
}

export default function MierMirror({ question, answer }: MierMirrorProps) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"thinking" | "revealed">("thinking");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset state on new question/answer
    setDisplayed("");
    setPhase("thinking");
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Thinking phase: animate dots
    let dots = 0;
    const thinkingInterval = setInterval(() => {
      dots++;
      setDisplayed(".".repeat((dots % 3) + 1));
      
      // After ~2 seconds, switch to revealed
      if (dots >= 6) {
        clearInterval(thinkingInterval);
        setPhase("revealed");
        setDisplayed(""); // Clear dots
        startTyping();
      }
    }, 300);

    intervalRef.current = thinkingInterval;

    const startTyping = () => {
      let charIndex = 0;
      // Faster typing speed (10ms) for smoother delivery of long text
      const typingInterval = setInterval(() => {
        setDisplayed(answer.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === answer.length) {
          clearInterval(typingInterval);
        }
      }, 10);
      intervalRef.current = typingInterval;
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [answer]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-[0_0_40px_rgba(0,0,0,0.5)] text-white font-mono relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30"></div>

      <div className="mb-4 text-slate-400 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
        <i className="fas fa-user-astronaut"></i> Operator Query
      </div>
      <div className="mb-8 pl-4 border-l-2 border-slate-700 text-slate-200 italic">
        "{question}"
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>

      <div className="mb-2 text-amber-500/80 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
        <i className="fas fa-infinity"></i> Reflection
      </div>
      <div
        className={`mt-4 text-lg leading-relaxed whitespace-pre-wrap ${
          phase === "thinking"
            ? "text-amber-400 animate-pulse"
            : "text-rose-100 font-medium tracking-wide"
        }`}
      >
        {displayed}
        {phase === "revealed" && displayed.length < answer.length && (
          <span className="animate-pulse text-amber-500">_</span>
        )}
      </div>

      {phase === "revealed" && displayed.length === answer.length && (
        <div className="mt-8 text-slate-600 text-[10px] uppercase tracking-widest text-right animate-in fade-in duration-1000">
          // truth delivered without explanation
        </div>
      )}
    </div>
  );
}