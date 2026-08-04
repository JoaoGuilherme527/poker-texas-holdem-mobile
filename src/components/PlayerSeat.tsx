import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Player } from '../types';
import { Card } from './Card';
import { cn } from '../lib/utils';
import { User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  style?: React.CSSProperties;
}

export const PlayerSeat = React.memo<PlayerSeatProps>(({ player, isCurrentTurn, style }) => {
  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('FOLD')) return 'bg-rose-500 text-white border-rose-600';
    if (act.includes('CHECK')) return 'bg-slate-500 text-white border-slate-600';
    if (act.includes('CALL')) return 'bg-sky-500 text-white border-sky-600';
    if (act.includes('RAISE')) return 'bg-amber-500 text-black border-amber-600';
    if (act.includes('ALL IN')) return 'bg-violet-600 text-white border-violet-700';
    return 'bg-emerald-500 text-black border-emerald-600';
  };
  const isFolded = player.isFolded;
  const isOut = player.stack <= 0 && !player.isActive && !player.isWinner;
  const [zoomedCards, setZoomedCards] = useState(false);
  // Bots only reveal cards if they won at a real showdown (meaning they have a winningHandDesc)
  const hiddenCards = !player.isHuman && !(player.isWinner && player.winningHandDesc);

  return (
    <>
      <div
        className={cn(
          "absolute flex flex-col items-center transition-all duration-500 z-20",
          isFolded && "opacity-40 grayscale-[0.5]",
          isOut && "opacity-20 scale-90"
        )}
        style={style}
      >
        {/* Cards container */}
        <div
          className={cn("flex -space-x-4 mb-2 h-10 items-end justify-center", !hiddenCards && "cursor-pointer active:scale-95 transition-transform")}
          onClick={(e) => {
            e.stopPropagation();
            if (!hiddenCards && player.cards && player.cards.length > 0) {
              setZoomedCards(true);
            }
          }}
        >
          {player.cards && player.cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 10, opacity: 0, rotate: idx === 0 ? -15 : 15 }}
              animate={{
                y: 0,
                opacity: 1,
                rotate: idx === 0 ? -10 : 10,
                scale: isCurrentTurn ? 1.1 : 1
              }}
            >
              <Card card={card} hidden={hiddenCards} size="sm" />
            </motion.div>
          ))}
        </div>

        {/* Seat Info */}
        <div className="relative">
          {/* Chips Bet Display */}
          <AnimatePresence>
            {player.bet > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: -35 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-400/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600 shadow-sm" />
                ${Math.floor(player.bet)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dealer Button */}
          {player.isDealer && (
            <div className="absolute -top-1 -right-1 bg-white text-orange-800 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-gray-400 shadow-sm z-30">
              D
            </div>
          )}

          {/* Winner Label */}
          {player.isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-lg z-30"
            >
              WINNER
            </motion.div>
          )}

          {/* Action Badge */}
          <AnimatePresence>
            {player.lastAction && !player.speech && (
              <motion.div
                initial={{ scale: 0, y: 10, x: '-50%' }}
                animate={{ scale: 1, y: -20, x: '-50%' }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn("absolute top-0 left-1/2 text-[9px] font-black px-2 py-0.5 rounded-full z-40 border shadow-xl whitespace-nowrap", getActionColor(player.lastAction))}
              >
                {player.lastAction}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speech Bubble */}
          <AnimatePresence>
            {player.speech && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: -30 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
              >
                <div className="relative bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-2xl shadow-xl whitespace-nowrap border border-black/10">
                  {player.speech.text}
                  {/* Speech bubble tail */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "flex items-center rounded-full pl-1 pr-3 py-1 border shadow-md backdrop-blur-sm transition-colors",
            isCurrentTurn ? "bg-amber-400/10 border-amber-400/30" : "bg-[#DEB887]/10 border-[#DEB887]/20"
          )}>
            {/* Avatar Ring */}
            <div className={cn(
              "w-8 h-8 rounded-full border flex items-center justify-center transition-all relative shrink-0 mr-2",
              isCurrentTurn ? "border-amber-400 ring-2 ring-amber-400/30" : "border-[#DEB887]/30",
              player.isWinner ? "border-amber-400 bg-amber-400/20" : "bg-black/60"
            )}>
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={16} className={cn(isCurrentTurn ? "text-amber-400" : "text-[#DEB887]/60")} />
              )}

              {/* Active Turn Pulse */}
              {isCurrentTurn && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-amber-400"
                  animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* Name & Position */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn(
                  "text-[8px] font-black uppercase px-1 rounded-[3px] leading-tight",
                  isCurrentTurn ? "bg-amber-400 text-black" : "bg-[#DEB887] text-black"
                )}>{player.position}</span>
                <span className={cn(
                  "text-[10px] font-bold truncate max-w-[55px] leading-tight",
                  isCurrentTurn ? "text-amber-400" : "text-white/90"
                )}>{player.name}</span>
              </div>

              <div className="text-[10px] font-mono text-emerald-400 leading-none">
                <span className="opacity-50 mr-0.5">$</span>{Math.floor(player.stack)}
              </div>
            </div>
          </div>
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {zoomedCards && player.cards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomedCards(false);
              }}
              className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50, rotateX: 20 }}
                animate={{ scale: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.5, y: 50, rotateX: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="flex justify-center gap-4 relative bg-[#121513]/90 p-8 pt-12 pb-10 rounded-3xl border border-emerald-500/25 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedCards(false); }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white/50 hover:text-white rounded-full transition-colors z-20"
                >
                  <X size={16} />
                </button>
                {player.cards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ rotate: idx === 0 ? -10 : 10, y: 20, opacity: 0, x: idx === 0 ? -20 : 20 }}
                    animate={{ rotate: 0, y: 0, opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 300 }}
                    className="z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] transform-gpu"
                  >
                    <Card card={card} size="lg" />
                  </motion.div>
                ))}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1D1A] border border-white/10 text-white/70 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-widest whitespace-nowrap">
                  Suas Cartas
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
});
