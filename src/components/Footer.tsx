import React from 'react';
import { LogOut, Bookmark, BarChart3 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="p-6 pb-10 flex items-center justify-between gap-6">
      <div className="flex items-center gap-6 text-emerald-100/60">
        <button className="hover:text-emerald-100 transition-colors">
          <LogOut size={22} />
        </button>
        <button className="hover:text-emerald-100 transition-colors">
          <Bookmark size={22} />
        </button>
        <button className="hover:text-emerald-100 transition-colors">
          <BarChart3 size={22} />
        </button>
      </div>

      <button className="flex-1 max-w-[200px] h-14 bg-[#98D8BA] text-[#121513] font-bold rounded-full shadow-lg shadow-emerald-500/10 active:scale-95 transition-transform">
        Próxima mão
      </button>
    </footer>
  );
};
