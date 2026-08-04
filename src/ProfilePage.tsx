import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, TrendingUp, Calendar, ChevronRight, Award, Trophy, Star, ShieldAlert } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, getDoc, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

interface ProfileData {
  username: string;
  role: string;
  matchesCount: number;
  winRate: number;
  balance: number;
  chartPoints: number[];
  recentMatches: {
    id: string;
    title: string;
    pot: number;
    profit: number;
    date: string;
  }[];
}

const MOCK_PROFILES: Record<string, ProfileData> = {
  player_1: {
    username: "João Guilherme",
    role: "Lenda Vip",
    matchesCount: 142,
    winRate: 58.2,
    balance: 15400,
    chartPoints: [1000, 1200, 950, 1400, 2200, 1900, 2800, 3500, 3100, 5600],
    recentMatches: [
      { id: 'hand_2', title: 'Royal Flush Épico vs Bot Isabella', pot: 5200, profit: 2600, date: '22 Mai 2026' },
      { id: 'hand_1', title: 'Dois Pares Divididos vs Bot Gabriel', pot: 1400, profit: 0, date: '22 Mai 2026' }
    ]
  },
  player_2: {
    username: "Bot Rafael",
    role: "Tubarão das Mesas",
    matchesCount: 320,
    winRate: 54.5,
    balance: 8410,
    chartPoints: [5000, 4800, 5200, 5000, 6100, 5800, 6800, 6500, 8000, 8410],
    recentMatches: [
      { id: 'hand_3', title: 'Quadra de Ás vs Você', pot: 8400, profit: 4200, date: '22 Mai 2026' },
      { id: 'hand_1', title: 'Dois Pares Divididos vs Você', pot: 1400, profit: 0, date: '22 Mai 2026' }
    ]
  }
};

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const activeId = userId || 'player_1';
      
      // 1. Check if mock profile exists
      if (MOCK_PROFILES[activeId]) {
        setProfile(MOCK_PROFILES[activeId]);
        setLoading(false);
        return;
      }

      // 2. Try fetching from Firestore (if a real user ID)
      try {
        const userDocRef = doc(db, 'users', activeId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Try retrieving matches
          const matchesQuery = query(
            collection(db, 'users', activeId, 'matches'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const matchesSnap = await getDocs(matchesQuery);
          const matchesList: any[] = [];
          
          let wins = 0;
          matchesSnap.forEach(doc => {
            const m = doc.data();
            matchesList.push({
              id: doc.id,
              title: m.winningHandDesc ? `Showdown: ${m.winningHandDesc}` : 'Mão Disputada',
              pot: m.pot || 0,
              profit: m.isWinner ? (m.pot || 0) : -(m.bet || 0),
              date: m.createdAt?.toDate().toLocaleDateString('pt-BR') || 'Recente'
            });
            if (m.isWinner) wins++;
          });

          const totalPlayed = userData.matchesPlayed || matchesList.length || 10;
          const calculatedWinRate = totalPlayed > 0 ? (wins / Math.max(1, matchesList.length)) * 100 : 50;

          setProfile({
            username: userData.username || userData.email?.split('@')[0] || "Jogador",
            role: "Competidor",
            matchesCount: totalPlayed,
            winRate: Math.round((userData.winRate || calculatedWinRate) * 10) / 10,
            balance: userData.stack !== undefined ? userData.stack : 1000,
            chartPoints: [200, 400, 300, 600, 800, 700, 1000, userData.stack || 1000],
            recentMatches: matchesList.length > 0 ? matchesList : [
              { id: 'hand_1', title: 'Showdown de Amostra (Split Pot)', pot: 1400, profit: 0, date: 'Mão Recente' }
            ]
          });
        } else {
          // Fallback to Player 1 if user ID does not exist in Firestore
          setProfile(MOCK_PROFILES['player_1']);
        }
      } catch (err) {
        console.warn("Firestore fetch restricted or failed, loading guest profile:", err);
        setProfile(MOCK_PROFILES['player_1']);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#064e3b] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#98D8BA] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#DEB887] font-black animate-pulse">Carregando Perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // SVG Chart Geometry Calculations
  const chartW = 340;
  const chartH = 140;
  const minVal = Math.min(...profile.chartPoints);
  const maxVal = Math.max(...profile.chartPoints);
  const valRange = maxVal - minVal || 100;

  const pointsSvg = profile.chartPoints.map((val, idx) => {
    const x = (idx / (profile.chartPoints.length - 1)) * chartW;
    const y = chartH - ((val - minVal) / valRange) * (chartH - 20) - 10;
    return { x, y };
  });

  const pathD = pointsSvg.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  return (
    <div className="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans overflow-x-hidden relative pb-10">
      {/* Background visual overlays */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[radial-gradient(circle_at_50%_0%,rgba(152,216,186,0.15),transparent_60%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-black uppercase tracking-wider text-xs bg-gradient-to-r from-white to-[#DEB887] bg-clip-text text-transparent">
          Estatísticas Públicas
        </span>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6 z-10">
        {/* User Card Header */}
        <div className="bg-black/35 border border-[#DEB887]/15 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-xl text-center relative overflow-hidden">
          {/* Glowing ring */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#98D8BA]/10 rounded-full blur-xl pointer-events-none" />

          {/* User Avatar Circle */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#022c22] border-[3px] border-url(#goldGrad) stroke-[#DEB887] flex items-center justify-center shadow-lg">
              <User size={40} className="text-[#DEB887]" />
            </div>
            <div className="absolute -bottom-1 right-0 bg-[#98D8BA] text-[#121513] p-1.5 rounded-full border-2 border-[#064e3b] shadow">
              <Trophy size={14} />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-black uppercase text-white tracking-tight">{profile.username}</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-[#DEB887]/10 border border-[#DEB887]/20 rounded-full text-[9px] font-black uppercase text-[#DEB887] tracking-wider">
              {profile.role}
            </span>
          </div>

          {/* Mini Info grid */}
          <div className="grid grid-cols-3 gap-2 w-full border-t border-white/5 pt-4 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Partidas</span>
              <span className="text-sm font-black font-mono mt-1 text-white">{profile.matchesCount}</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/5">
              <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Win Rate</span>
              <span className="text-sm font-black font-mono mt-1 text-[#98D8BA]">{profile.winRate}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Créditos</span>
              <span className="text-sm font-black font-mono mt-1 text-[#DEB887]">${profile.balance}</span>
            </div>
          </div>
        </div>

        {/* Bankroll Chart Card */}
        <div className="bg-black/25 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5 text-[#98D8BA]">
              <TrendingUp size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Curva de Lucros (EV)</span>
            </div>
            <span className="text-[9px] font-bold text-white/40 uppercase">Histórico Recente</span>
          </div>

          <div className="relative w-full aspect-[2.4/1] flex items-center justify-center p-2 rounded-2xl bg-black/20">
            {/* SVG Plot */}
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartW} ${chartH}`}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#98D8BA" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#98D8BA" stop-opacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1={chartH * 0.25} x2={chartW} y2={chartH * 0.25} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1={chartH * 0.5} x2={chartW} y2={chartH * 0.5} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1={chartH * 0.75} x2={chartW} y2={chartH * 0.75} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Shading */}
              <path d={fillD} fill="url(#chartGrad)" />

              {/* Main Line */}
              <path d={pathD} fill="none" stroke="#98D8BA" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points dots */}
              {pointsSvg.map((p, idx) => {
                const isLast = idx === pointsSvg.length - 1;
                return (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={isLast ? 5 : 3}
                    fill={isLast ? '#ffffff' : '#98D8BA'}
                    stroke={isLast ? '#98D8BA' : '#064e3b'}
                    strokeWidth={1.5}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between px-1 text-[8px] font-bold text-white/30 uppercase tracking-widest">
            <span>Início</span>
            <span>Atual</span>
          </div>
        </div>

        {/* Recent Matches links */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-[#DEB887] px-1">
            <Award size={15} />
            <span className="font-black uppercase tracking-wider text-xs">Mãos Marcantes Recentes</span>
          </div>

          <div className="flex flex-col gap-2">
            {profile.recentMatches.map((m, idx) => {
              const isProfit = m.profit > 0;
              const isNeutral = m.profit === 0;

              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/replay/${m.id}`)}
                  className="bg-black/35 hover:bg-black/50 border border-white/5 hover:border-[#DEB887]/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex flex-col gap-1 w-3/4">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-white/40 flex items-center gap-1">
                      <Calendar size={10} />
                      {m.date}
                    </span>
                    <h3 className="text-xs font-black uppercase text-white group-hover:text-[#98D8BA] transition-colors line-clamp-1">
                      {m.title}
                    </h3>
                    <span className="text-[9px] font-mono text-white/50">
                      Pote Total: ${m.pot}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black font-mono ${
                      isNeutral ? 'text-white/60' : isProfit ? 'text-[#98D8BA]' : 'text-red-400'
                    }`}>
                      {isNeutral ? 'DIVIDIDO' : `${isProfit ? '+' : '-'}$${Math.abs(m.profit)}`}
                    </span>
                    <ChevronRight size={14} className="text-white/30 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
