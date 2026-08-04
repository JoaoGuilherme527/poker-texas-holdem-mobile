import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

// Lista das mãos ordenadas do mais forte para o mais fraco
const POKER_HANDS = [
  { name: 'Royal Flush', desc: 'A, K, Q, J, 10 do mesmo naipe', ex: 'A♠ K♠ Q♠ J♠ 10♠' },
  { name: 'Straight Flush', desc: '5 cartas em sequência do mesmo naipe', ex: '9♥ 8♥ 7♥ 6♥ 5♥' },
  { name: 'Quadra', desc: '4 cartas do mesmo valor', ex: 'K♣ K♦ K♥ K♠ 4♣' },
  { name: 'Full House', desc: 'Uma trinca e um par', ex: '8♠ 8♥ 8♦ J♣ J♠' },
  { name: 'Flush', desc: '5 cartas do mesmo naipe, não em sequência', ex: 'A♣ J♣ 8♣ 5♣ 2♣' },
  { name: 'Straight (Sequência)', desc: '5 cartas em sequência, mas de naipes diferentes', ex: '10♥ 9♣ 8♠ 7♦ 6♥' },
  { name: 'Trinca', desc: '3 cartas do mesmo valor', ex: '7♣ 7♠ 7♦ K♥ 2♠' },
  { name: 'Dois Pares', desc: 'Dois pares de cartas do mesmo valor', ex: 'Q♥ Q♣ 4♠ 4♦ A♣' },
  { name: 'Um Par', desc: 'Um par de cartas do mesmo valor', ex: '10♠ 10♥ K♦ 7♣ 3♠' },
  { name: 'Carta Alta', desc: 'Nenhuma combinação, ganha a maior carta', ex: 'A♥ J♣ 9♦ 5♠ 2♥' },
];

interface HandsGuideProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MiniCard: React.FC<{ cardStr: string }> = ({ cardStr }) => {
  const rank = cardStr.slice(0, -1);
  const suit = cardStr.slice(-1);
  const isRed = suit === '♥' || suit === '♦';
  return (
    <div className={`w-8 h-11 bg-white rounded flex flex-col items-center justify-center border border-gray-300 shadow-sm ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
      <span className="text-[14px] font-black leading-none">{rank}</span>
      <span className="text-[12px] leading-none">{suit}</span>
    </div>
  );
};

export const HandsGuide: React.FC<HandsGuideProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-16 right-4 z-[45] w-10 h-10 rounded-full bg-[#1A1D1A] border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-black/40 shadow-lg transition-all duration-300",
          isOpen ? "md:right-[336px] right-[304px]" : "right-4"
        )}
        title="Guia de Mãos"
      >
        <Info size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[280px] sm:w-80 h-full bg-[#1A1D1A]/95 backdrop-blur-md border-l border-emerald-900/30 z-[60] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5 pt-6">
              <h3 className="font-black text-emerald-400 uppercase tracking-wider text-sm">Ranking das Mãos</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar pb-24">
              {POKER_HANDS.map((hand, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-white font-bold">{hand.name}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2 leading-tight">{hand.desc}</p>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {hand.ex.split(' ').map((card, i) => (
                      <MiniCard key={i} cardStr={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
