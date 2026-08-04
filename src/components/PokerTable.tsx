import React from 'react';
import { Player, CardData } from '../types';
import { PlayerSeat } from './PlayerSeat';
import { Card } from './Card';
import { Coins } from 'lucide-react';
import { motion } from 'motion/react';

interface PokerTableProps {
  players: Player[];
  communityCards: CardData[];
  pot: number;
  currentTurnIndex: number;
}

// Strict absolute positioning using percentages for an orbital layout
const SEAT_STYLES: React.CSSProperties[] = [
  { top: '84%', left: '50%', transform: 'translate(-50%, -50%)' }, // User (Bottom)
  { top: '65%', left: '15%', transform: 'translate(-50%, -50%)' }, // Left Mid
  { top: '30%', left: '15%', transform: 'translate(-50%, -50%)' }, // Left Top
  { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' }, // Top Mid
  { top: '30%', left: '85%', transform: 'translate(-50%, -50%)' }, // Right Top
  { top: '65%', left: '85%', transform: 'translate(-50%, -50%)' }, // Right Mid
];

export const PokerTable: React.FC<PokerTableProps> = ({ players, communityCards, pot, currentTurnIndex }) => {

  return (
    <div className="relative w-full aspect-[4/5] max-w-sm mx-auto flex items-center justify-center p-4 scale-90">
      {/* The Table Elipse */}
      <div className="absolute inset-8 rounded-[48%] border-[10px] border-black/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-emerald-950 overflow-hidden">
        {/* Felt Gradient */}
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-emerald-500/80 to-emerald-900 border border-emerald-400/30 relative">
          {/* Subtle line */}
          <div className="absolute inset-10 rounded-[48%] border border-emerald-400/10 pointer-events-none" />

          {/* Felt Texture Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />
        </div>
      </div>

      {/* Community Cards & Pot Area */}
      <div className="relative flex flex-col items-center gap-3 z-10 pt-4">
        {/* Pot Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-emerald-400/40 backdrop-blur-md shadow-lg">
            <Coins size={16} className="text-amber-400" />
            <span className="text-white font-mono font-bold text-lg">${Math.floor(pot)}</span>
          </div>
          {players[0] && (
            <div className="text-[9px] uppercase tracking-wider text-white/50 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
              Seu Investimento: ${Math.floor(players[0].initialStack - players[0].stack)}
            </div>
          )}
        </motion.div>

        {/* Board Cards */}
        <div className="flex flex-col items-center gap-2">
          {/* Flop */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="w-9 h-13 shrink-0" style={{ perspective: 1000 }}>
                <motion.div
                  initial={false}
                  animate={{ rotateY: communityCards[idx] ? 0 : 180 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="w-full h-full relative"
                >
                  <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <Card hidden={true} size="md" className="w-full h-full" />
                  </div>
                  <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                    <Card card={communityCards[idx]} size="md" className="w-full h-full" />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Turn & River */}
          <div className="flex gap-1.5 ml-1">
            {[3, 4].map((idx) => (
              <div key={idx} className="w-9 h-13 shrink-0" style={{ perspective: 1000 }}>
                <motion.div
                  initial={false}
                  animate={{ rotateY: communityCards[idx] ? 0 : 180 }}
                  transition={{ duration: 0.6, delay: (idx - 3) * 0.2 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="w-full h-full relative"
                >
                  <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <Card hidden={true} size="md" className="w-full h-full" />
                  </div>
                  <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                    <Card card={communityCards[idx]} size="md" className="w-full h-full" />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Seats - Explicitly positioned around the ring */}
      {players.map((player, index) => (
        <PlayerSeat
          key={player.id}
          player={player}
          isCurrentTurn={index === currentTurnIndex}
          style={SEAT_STYLES[index]}
        />
      ))}
    </div>
  );
};
