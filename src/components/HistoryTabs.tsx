import React from 'react';
import { cn } from '../lib/utils';

type Phase = "Turn" | "River" | "Encerrado";

interface HistoryTabsProps {
  activePhase: Phase;
  onPhaseChange: (phase: Phase) => void;
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({ activePhase, onPhaseChange }) => {
  const phases: Phase[] = ["Turn", "River", "Encerrado"];

  return (
    <div className="flex items-center gap-4 px-6 overflow-x-auto no-scrollbar py-4">
      {phases.map((phase) => (
        <button
          key={phase}
          onClick={() => onPhaseChange(phase)}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
            activePhase === phase 
              ? "bg-emerald-950/80 text-emerald-100 border border-emerald-800" 
              : "text-gray-500 hover:text-gray-300"
          )}
        >
          {phase}
        </button>
      ))}
    </div>
  );
};
