import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActionLogProps {
  logs: { id?: string; playerName: string; action: string }[];
  isGuideOpen?: boolean;
}

export const ActionLog: React.FC<ActionLogProps> = ({ logs, isGuideOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 z-40 w-10 h-10 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-white/70 hover:bg-black/80 transition-all duration-300",
          isGuideOpen ? "md:right-[336px] right-[304px]" : "right-4"
        )}
      >
        <ScrollText size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-72 h-full bg-[#1A1D1A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-black text-white uppercase tracking-wider text-sm">Registro de Ações</h3>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 no-scrollbar">
                {logs.map((log, idx) => (
                  <div key={log.id || `log-${idx}`} className="bg-white/5 rounded-xl p-3 flex flex-col border border-white/5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase mb-1">{log.playerName}</span>
                    <span className="text-xs text-white/90 font-medium">{log.action}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-white/30 text-center text-xs mt-10 font-medium uppercase tracking-wider">
                    Nenhuma ação registrada
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
