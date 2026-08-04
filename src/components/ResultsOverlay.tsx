import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, FastForward, Play, ListOrdered, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Player } from '../types';
import { Card } from './Card';
import { sounds } from '../lib/soundManager';

interface ResultsOverlayProps {
  players: Player[];
  communityCards: string[];
  onNextHand: () => void;
  onLeave: () => void;
}

export const ResultsOverlay: React.FC<ResultsOverlayProps> = ({ players, communityCards, onNextHand, onLeave }) => {
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const winners = players.filter(p => p.isWinner);
  const losers = players.filter(p => !p.isFolded && !p.isWinner);
  const humanPlayer = players.find(p => p.isHuman);

  useEffect(() => {
    if (!isMinimized) {
      sounds.playWinnerGlow();
    }
  }, [isMinimized]);

  if (showScoreboard) {
    const rankedPlayers = [...players].sort((a, b) => (b.stack - b.initialStack) - (a.stack - a.initialStack));
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="w-full max-w-sm bg-[#1A1D1A] border border-emerald-900/50 rounded-3xl p-5 sm:p-6 relative max-h-[85vh] flex flex-col">
          <button onClick={() => setShowScoreboard(false)} className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
            <X size={20} />
          </button>
          <h2 className="text-lg sm:text-xl font-black text-white mb-4 sm:mb-6 uppercase tracking-wider">Placar</h2>
          <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1">
            {rankedPlayers.map((player, idx) => {
              const diff = player.stack - player.initialStack;
              return (
                <div key={player.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 font-bold text-xs w-4">{idx + 1}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-white/90 truncate max-w-[100px]">{player.name}</span>
                      {player.handDesc && <span className="text-[9px] text-white/40">{player.handDesc}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-bold text-emerald-400 text-sm">${Math.floor(player.stack)}</span>
                    <span className={`text-[9px] font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {diff >= 0 ? '+$' : '-$'}{Math.floor(Math.abs(diff))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-8 flex flex-col gap-2">
        <button onClick={onNextHand} className="h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm sm:text-base shadow-lg">
          <Play size={18} fill="currentColor" /> Próxima Mão
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setIsMinimized(false)} className="h-10 sm:h-12 bg-[#1A1D1A]/90 backdrop-blur-md text-white font-bold uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-colors border border-white/10 shadow-lg relative">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Resultados
          </button>
          <button onClick={() => setShowScoreboard(true)} className="h-10 sm:h-12 bg-[#1A1D1A]/90 backdrop-blur-md text-white font-bold uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-colors border border-white/10 shadow-lg">
            <ListOrdered size={14} className="sm:w-4 sm:h-4 shrink-0" /> Placar
          </button>
          <button onClick={onLeave} className="h-10 sm:h-12 bg-rose-500/20 backdrop-blur-md text-rose-400 font-bold uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-colors border border-rose-500/20 shadow-lg">
            <LogOut size={14} className="sm:w-4 sm:h-4 shrink-0" /> Sair
          </button>
        </div>
      </div>
    );
  }

  const renderPlayer = (p: Player, isWinner: boolean, wonByFold: boolean) => {
    const handDescription = isWinner ? p.winningHandDesc : p.handDesc;
    return (
      <div key={p.id} className={cn(
        "border rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden transition-colors shrink-0",
        isWinner ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-[#1A1D1A]/80 border-white/10 opacity-70"
      )}>
        {isWinner && (
          <>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-shimmer pointer-events-none" />
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg z-10 shadow-sm">
              Vencedor
            </div>
          </>
        )}
        
        <p className={cn("font-black text-base mb-0.5", isWinner ? "text-white relative z-10" : "text-white/70")}>
          {p.name} {p.isHuman && "(Você)"}
        </p>
        
        <p className={cn("text-[10px] font-bold mb-2 px-3 py-0.5 rounded-full relative z-10", isWinner ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/50")}>
          {handDescription || (wonByFold ? 'Venceu por Desistência' : 'Cartas não reveladas')}
        </p>
        
        {!wonByFold && (
          <div className="flex flex-col gap-2 items-center w-full mt-1 relative z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] uppercase font-bold text-white/30 tracking-wider">Cartas da Mão</span>
              <div className="flex justify-center gap-2">
                {p.cards && p.cards.length === 2 ? (
                  <>
                    <Card card={p.cards[0]} size="xs" />
                    <Card card={p.cards[1]} size="xs" />
                  </>
                ) : (
                  <span className="text-white/20 text-[10px]">Sem cartas</span>
                )}
              </div>
            </div>

            {p.bestCards && p.bestCards.length > 0 && (
              <div className="flex flex-col items-center gap-1 bg-black/40 p-2 rounded-xl border border-white/10 w-full mt-2">
                <span className="text-[8px] uppercase font-bold text-emerald-400/70 tracking-wider">Combinação</span>
                <div className="flex justify-center gap-1">
                  {p.bestCards.map((c, i) => {
                    const isHoleCard = p.cards?.some(hc => hc.rank === c.rank && hc.suit === c.suit);
                    return <Card key={i} card={c} size="xs" highlight={isHoleCard} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const wonByFold = losers.length === 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end p-4 pb-8"
    >
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-[#121513]/95 border border-emerald-900/50 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-hidden relative"
      >
        <button 
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors z-20"
          title="Minimizar e ver a mesa"
        >
          <X size={18} />
        </button>

        <div className="text-center mt-2">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-400 mb-0">Rodada Finalizada</h2>
        </div>

        {/* Community Cards Display */}
        {communityCards && communityCards.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center border border-white/5 shrink-0">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-2">Cartas da Mesa</span>
            <div className="flex justify-center gap-1">
              {communityCards.map((c, i) => <Card key={i} card={c} size="sm" />)}
            </div>
          </div>
        )}

        {/* Showdown Players */}
        <div className="flex flex-col gap-4 overflow-y-auto w-full no-scrollbar px-1 pb-2 flex-1">
          {winners.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px bg-emerald-500/30 flex-1"></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Vencedor{winners.length > 1 ? 'es' : ''}</span>
                <div className="h-px bg-emerald-500/30 flex-1"></div>
              </div>
              {winners.map(p => renderPlayer(p, true, wonByFold))}
            </div>
          )}

          {losers.length > 0 && (
            <div className="flex flex-col gap-2 opacity-80">
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Outros Jogadores</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              {losers.map(p => renderPlayer(p, false, wonByFold))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2 shrink-0">
          <button onClick={onNextHand} className="h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
            <Play size={18} fill="currentColor" /> Próxima Mão
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowScoreboard(true)} className="h-10 sm:h-12 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
              <ListOrdered size={14} className="sm:w-4 sm:h-4" /> Placar
            </button>
            <button onClick={onLeave} className="h-10 sm:h-12 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-rose-500/10">
              <LogOut size={14} className="sm:w-4 sm:h-4" /> Sair
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
