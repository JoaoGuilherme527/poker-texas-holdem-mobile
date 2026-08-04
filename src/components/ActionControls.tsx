import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { X, ChevronUp } from 'lucide-react';

interface ActionControlsProps {
  onAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => void;
  canCheck: boolean;
  callAmount: number;
  currentBet: number;
  minRaise: number;
  maxRaise: number;
  pot: number;
  disabled?: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  onAction,
  canCheck,
  callAmount,
  currentBet,
  minRaise,
  maxRaise,
  pot,
  disabled
}) => {
  const actualMinRaise = Math.min(minRaise, maxRaise);
  const [showRaiseMenu, setShowRaiseMenu] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(actualMinRaise);

  const raisePresets = [
    { label: '33%', factor: 0.33 },
    { label: '50%', factor: 0.5 },
    { label: '66%', factor: 0.66 },
    { label: 'Pote', factor: 1 },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(Number(e.target.value));
  };

  const handlePreset = (factor: number) => {
    // Calculo simples e intuitivo para o jogador casual:
    // O valor A ADICIONAR (raise) será a fração do pote atual.
    // Assim 50% do pote (ex: pote 200) = adicionar 100.
    const raiseValue = Math.floor(pot * factor);
    const targetAmount = currentBet + raiseValue;
    
    // The actual bet must be at least minRaise and at most maxRaise
    const finalAmount = Math.max(actualMinRaise, Math.min(maxRaise, targetAmount));
    setRaiseAmount(finalAmount);
  };

  useEffect(() => {
    setRaiseAmount(actualMinRaise);
  }, [actualMinRaise]);

  if (showRaiseMenu) {
    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 w-full bg-[#1A1D1A] border-t border-emerald-900/50 p-6 z-50 rounded-t-[32px] shadow-2xl"
      >
        <div className="max-w-md mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">Raise</h3>
            <button 
              onClick={() => setShowRaiseMenu(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {raisePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.factor)}
                className="py-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] uppercase font-black text-white/30">Valor Customizado</span>
              <span className="text-emerald-400 font-mono font-bold text-xl">${Math.floor(raiseAmount)}</span>
            </div>
            <input 
              type="range" 
              min={actualMinRaise} 
              max={maxRaise} 
              step={1}
              value={raiseAmount}
              onChange={handleSliderChange}
              className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              onAction('raise', raiseAmount);
              setShowRaiseMenu(false);
            }}
            className="w-full h-16 bg-[#98D8BA] text-[#121513] font-black uppercase rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            Confirmar Ação (${Math.floor(raiseAmount)})
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-3 max-w-sm mx-auto w-full transition-all", disabled && "opacity-50 pointer-events-none")}>
      <button 
        onClick={() => onAction('fold')}
        className="h-12 sm:h-16 bg-sky-400/20 text-sky-400 font-black uppercase text-xs sm:text-sm rounded-2xl border border-sky-400/30 shadow-lg active:scale-95 transition-all"
      >
        Fold
      </button>
      
      <button 
        onClick={() => onAction(canCheck ? 'check' : 'call')}
        className="h-12 sm:h-16 bg-emerald-950/80 text-emerald-100 font-black uppercase text-xs sm:text-sm rounded-2xl border border-emerald-900 shadow-lg active:scale-95 transition-all"
      >
        {canCheck ? 'Check' : `Call $${Math.floor(callAmount)}`}
      </button>

      <button 
        onClick={() => setShowRaiseMenu(true)}
        disabled={actualMinRaise >= maxRaise}
        className={cn(
          "h-12 sm:h-16 font-black uppercase text-xs sm:text-sm rounded-2xl border shadow-lg active:scale-95 transition-all",
          actualMinRaise >= maxRaise 
            ? "bg-rose-500/5 text-rose-500/30 border-rose-500/10" 
            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
        )}
      >
        Raise
      </button>

      <button 
        onClick={() => onAction('raise', maxRaise)}
        className="h-12 sm:h-16 bg-rose-500/40 text-rose-100 font-black uppercase text-xs sm:text-sm rounded-2xl border border-rose-500/50 shadow-lg active:scale-95 transition-all"
      >
        All In
      </button>
    </div>
  );
};
