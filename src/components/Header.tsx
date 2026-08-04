import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onLeave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLeave }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="p-2 sm:p-4 flex items-center justify-between shrink-0 w-full z-40">
      <button 
        onClick={onLeave}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/20 flex items-center justify-center text-white/70 hover:bg-black/40 transition-colors"
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Language Switcher */}
      <div className="flex items-center bg-black/30 backdrop-blur-md border border-white/5 rounded-full p-0.5 shadow-lg">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
            language === 'en'
              ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('pt')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
            language === 'pt'
              ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          PT
        </button>
      </div>
    </header>
  );
};
