import React from 'react';
import { CardData, Suit } from '../types';
import { cn } from '../lib/utils'; // I'll create this helper

interface CardProps {
  card?: CardData;
  hidden?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  clubs: 'text-black',
  diamonds: 'text-red-600',
  hearts: 'text-red-600',
  spades: 'text-black',
};

export const Card = React.memo<CardProps & { highlight?: boolean }>(({ card, hidden, className, size = 'md', highlight }) => {
  if (hidden || !card) {
    return (
      <div 
        className={cn(
          "bg-blue-800 border-2 border-white rounded-md shadow-sm",
          size === 'xs' ? "w-5 h-7" : size === 'sm' ? "w-6 h-9" : size === 'md' ? "w-8 h-12" : "w-10 h-14",
          className
        )}
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' }}
      />
    );
  }

  const { rank, suit } = card;
  const isRed = suit === 'hearts' || suit === 'diamonds';

  return (
    <div 
      className={cn(
        "bg-white border border-black/10 rounded-[4px] shadow-sm relative select-none",
        size === 'xs' ? "w-5 h-7" : size === 'sm' ? "w-7 h-10" : size === 'md' ? "w-9 h-13" : "w-11 h-15",
        highlight && "ring-[3px] ring-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10",
        className
      )}
    >
      {/* Top Rank */}
      <div className={cn(
        "absolute top-0.5 left-1 font-bold leading-none", 
        size === 'xs' ? "text-[6px]" : size === 'sm' ? "text-[7px]" : "text-[10px]",
        isRed ? "text-red-600" : "text-black"
      )}>
        {rank}
      </div>

      {/* Center Suit */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none", 
        size === 'xs' ? "text-[8px]" : size === 'sm' ? "text-xs" : "text-lg",
        suitColors[suit]
      )}>
        {suitSymbols[suit]}
      </div>

      {/* Bottom Rank - Inverted correctly */}
      <div className={cn(
        "absolute bottom-0.5 right-1 font-bold leading-none rotate-180", 
        size === 'xs' ? "text-[6px]" : size === 'sm' ? "text-[7px]" : "text-[10px]",
        isRed ? "text-red-600" : "text-black"
      )}>
        {rank}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.hidden === nextProps.hidden &&
         prevProps.className === nextProps.className &&
         prevProps.size === nextProps.size &&
         prevProps.highlight === nextProps.highlight &&
         prevProps.card?.rank === nextProps.card?.rank &&
         prevProps.card?.suit === nextProps.card?.suit;
});
