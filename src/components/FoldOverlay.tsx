import React from 'react';
import { motion } from 'motion/react';
import { LogOut, FastForward, Play } from 'lucide-react';

interface FoldOverlayProps {
  onFastForward: () => void;
  onLeave: () => void;
}

export const FoldOverlay: React.FC<FoldOverlayProps> = ({ onFastForward, onLeave }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 w-full bg-[#121513]/95 backdrop-blur-md border-t border-rose-500/50 p-6 z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4"
    >
      <h3 className="text-rose-400 font-black uppercase tracking-wider text-sm mb-2">Você desistiu</h3>
      
      <div className="flex justify-center w-full max-w-sm">
        <button onClick={onFastForward} className="w-full h-14 bg-sky-500 text-sky-950 hover:bg-sky-400 font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
          <FastForward size={16} /> Ir para o Fim da Rodada
        </button>
      </div>
      
      <button onClick={onLeave} className="h-10 text-white/30 hover:text-white/80 font-bold uppercase text-[10px] flex items-center justify-center gap-1 transition-colors">
        <LogOut size={12} /> Sair da Mesa
      </button>
    </motion.div>
  );
};
