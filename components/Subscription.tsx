
import React, { useState } from 'react';
import { UserTier } from '../types';

// Adapting the provided template's PLANS to Mier Mirror architecture
const PLANS = [
  {
    id: 'STANDARD' as UserTier,
    title: 'Standard Operator',
    price: '$20',
    period: '/mo',
    accent: '#3b82f6', // Blue
    features: ['Flash Intelligence (Fast)', 'Standard Latency', 'Basic Code Generation', 'Standard Audio Rituals'],
    recommended: false
  },
  {
    id: 'ADVANCED' as UserTier,
    title: 'Sovereign Architect',
    price: '$50',
    period: '/mo',
    accent: '#f59e0b', // Amber
    features: ['Pro + Thinking (16k)', 'Deep Reasoning Logic', 'Advanced Security Audits', 'Priority Computation'],
    recommended: true
  }
];

// Local UniversalShard component
const UniversalShard: React.FC<{
  title: string;
  variant: 'blue' | 'amber' | 'ruby';
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, variant, glow, children, className = '' }) => {
  const borderColors = {
    blue: 'border-blue-500/30',
    amber: 'border-amber-500/30',
    ruby: 'border-red-500/30',
  };

  const glowStyles = {
    blue: 'shadow-[0_0_30px_rgba(59,130,246,0.15)] border-blue-500',
    amber: 'shadow-[0_0_30px_rgba(245,158,11,0.15)] border-amber-500',
    ruby: 'shadow-[0_0_30px_rgba(239,68,68,0.15)] border-red-500',
  };

  const textColors = {
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    ruby: 'text-red-500',
  };

  const baseBorder = borderColors[variant] || 'border-slate-700';
  const activeStyle = glow ? glowStyles[variant] : '';
  const titleColor = textColors[variant] || 'text-slate-400';

  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border ${glow ? activeStyle : baseBorder} p-6 relative overflow-hidden transition-all duration-500 ${className}`}>
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${titleColor} flex items-center gap-2`}>
                <i className="fas fa-microchip"></i>
                {title}
            </span>
            <div className="flex gap-1">
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            </div>
        </div>
        {children}
    </div>
  );
};

interface SubscriptionProps {
  onSubscribe: (tier: UserTier) => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<UserTier>('ADVANCED');
  const [processing, setProcessing] = useState<string | null>(null);

  const handlePayment = (provider: string) => {
    if (!selectedPlan) return;
    setProcessing(provider);
    
    // [SENTINEL]: Transmitting payment intent to the SignalBus
    // Simulating processing delay
    setTimeout(() => {
        onSubscribe(selectedPlan);
        setProcessing(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl w-full mx-auto p-6 space-y-10 animate-in fade-in duration-700 relative z-10">
      
            {/* Header: Clearance Level */}
            <header className="text-center space-y-3">
                <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                System_Clearance_Upgrade
                </h2>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                Accessing Higher-Level Intelligence Shards
                </p>
            </header>

            {/* Plans: Responsive Shard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PLANS.map((plan) => (
                <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative group cursor-pointer transition-all duration-500 transform ${selectedPlan === plan.id ? 'scale-[1.02] z-10' : 'opacity-60 hover:opacity-100 scale-95'}`}
                >
                    <UniversalShard 
                        title={plan.title} 
                        variant={plan.id === 'ADVANCED' ? 'amber' : 'blue'}
                        glow={selectedPlan === plan.id}
                        className="h-full"
                    >
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-4xl font-black text-white">
                        {plan.price}
                        <span className="text-sm text-white/30 ml-1 font-normal">{plan.period}</span>
                        </h3>
                        {plan.recommended && (
                        <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-none uppercase animate-pulse">
                            Priority_Node
                        </span>
                        )}
                    </div>

                    <ul className="space-y-4">
                        {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-[11px] font-mono text-white/70">
                            <span className={selectedPlan === plan.id ? (plan.id === 'ADVANCED' ? 'text-amber-400' : 'text-blue-400') : 'text-white/20'}>[✓]</span>
                            {feat}
                        </li>
                        ))}
                    </ul>
                    </UniversalShard>
                </div>
                ))}
            </div>

            {/* Payment Gateway: The Secure Shard */}
            <UniversalShard title="Secure_Gateway_Terminal" variant="ruby">
                <div className={`space-y-4 transition-all duration-500 ${!selectedPlan ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
                
                {/* Main Action */}
                <button 
                    onClick={() => handlePayment('STRIPE')}
                    disabled={!!processing}
                    className="w-full py-4 bg-white hover:bg-slate-200 text-black font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-wait rounded-none"
                >
                    {processing === 'STRIPE' ? (
                        <>
                            <i className="fas fa-circle-notch animate-spin"></i>
                            INITIALIZING_ENCRYPTION...
                        </>
                    ) : (
                        <>
                            Establish Secure Link (Card)
                            <i className="fas fa-arrow-right"></i>
                        </>
                    )}
                </button>

                {/* Quick-Link Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Apple', 'Google', 'PayPal', 'CashApp'].map((provider) => (
                    <button 
                        key={provider}
                        onClick={() => handlePayment(provider)}
                        disabled={!!processing}
                        className="py-3 border border-white/10 hover:border-white/40 hover:bg-white/5 text-[9px] font-mono uppercase text-white/60 transition-all flex items-center justify-center gap-2"
                    >
                        {processing === provider ? <i className="fas fa-circle-notch animate-spin"></i> : provider}
                    </button>
                    ))}
                </div>
                </div>

                <footer className="mt-8 pt-4 border-t border-white/5 text-center flex justify-between items-center text-white/20">
                    <p className="text-[8px] font-mono tracking-widest uppercase">
                        PCI-DSS_COMPLIANT // AES-256_ENCRYPTED
                    </p>
                    <i className="fas fa-lock text-xs"></i>
                </footer>
            </UniversalShard>
        </div>
    </div>
  );
};

export default Subscription;
