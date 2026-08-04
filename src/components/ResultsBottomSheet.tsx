import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../types';
import { User, LogOut, Bookmark, BarChart3, Medal } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultsBottomSheetProps {
  players: Player[];
  onNextHand: () => void;
  isWinner: boolean;
  onLeave?: () => void;
}

export const ResultsBottomSheet: React.FC<ResultsBottomSheetProps> = ({ players, onNextHand, isWinner, onLeave }) => {
  // Sort players by their final stack relative to initial stack (best performance)
  const rankedPlayers = [...players].sort((a, b) => (b.stack - b.initialStack) - (a.stack - a.initialStack));

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 w-full bg-[#1A1D1A] border-t border-white/5 z-50 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden"
    >
      <div className="p-8 pb-4 flex flex-col items-center">
        <div className="w-12 h-1 bg-white/10 rounded-full mb-6" />
        <h2 className={cn(
          "text-2xl font-black uppercase tracking-tighter mb-1",
          isWinner ? "text-emerald-400" : "text-rose-400"
        )}>
          {isWinner ? "Você Venceu!" : "Boa tentativa"}
        </h2>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Resumo da Mesa</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 no-scrollbar">
        {rankedPlayers.map((player, index) => {
          const diff = player.stack - player.initialStack;
          const bbDiff = (diff / 20).toFixed(1); // Assuming 1 BB = 20 chips
          
          return (
            <div 
              key={player.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-3xl transition-all",
                player.isHuman ? "bg-white/5 border border-white/10" : "bg-transparent"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-white/5 text-white/40"
                )}>
                  {index === 0 ? <Medal size={14} /> : index + 1}
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center border border-white/5">
                     <User size={18} className="text-emerald-500/30" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{player.name}</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase">{player.position}</span>
                   </div>
                </div>
              </div>

              <div className={cn(
                "font-mono font-bold text-sm",
                diff > 0 ? "text-emerald-400" : diff < 0 ? "text-white/40" : "text-white/20"
              )}>
                {diff > 0 ? `+${bbDiff} BB` : `${bbDiff} BB`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 pb-10 border-t border-white/5 flex items-center justify-between gap-6 bg-black/20">
        <div className="flex items-center gap-6 text-emerald-100/30">
          <button onClick={onLeave} className="hover:text-emerald-100 transition-colors"><LogOut size={22} /></button>
          <button className="hover:text-emerald-100 transition-colors"><Bookmark size={22} /></button>
          <button className="hover:text-emerald-100 transition-colors"><BarChart3 size={22} /></button>
        </div>

        <button 
          onClick={onNextHand}
          className="flex-1 max-w-[200px] h-14 bg-[#98D8BA] text-[#121513] font-black uppercase text-sm rounded-full shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Próxima mão
        </button>
      </div>
    </motion.div>
  );
};
