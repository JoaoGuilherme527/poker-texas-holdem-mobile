import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, ShieldCheck, Cpu, Zap, ArrowRight, Award, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'chart' | 'security'>('rooms');
  const [onlinePlayers, setOnlinePlayers] = useState(248);
  const [activeTables, setActiveTables] = useState(42);

  // Credit Flow Simulator Loop
  const [creditSimStep, setCreditSimStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCreditSimStep(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Phone Reload Simulator Loop
  const [reloadStep, setReloadStep] = useState(0); // 0: Waiting, 1: Scanning/Confirming, 2: Success
  const [reloadSeconds, setReloadSeconds] = useState(299);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setReloadSeconds(prev => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setReloadStep(prev => {
        if (prev === 0) return 1; // scanning
        if (prev === 1) return 2; // success
        return 0; // reset to waiting
      });
    }, 6000);
    return () => clearInterval(statusInterval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animate mock stats
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
      if (Math.random() > 0.8) {
        setActiveTables(prev => Math.max(35, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // HTML5 Canvas Poker Game Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    // Simulation states
    // 0: Idle/Setup, 1: Dealing, 2: Pre-flop betting, 3: Flop deal, 4: Turn deal, 5: River deal, 6: Showdown, 7: Pot Distribution, 8: Reset
    let simPhase = 1;
    let phaseTimer = 0;
    
    // Player definitions
    const players = [
      { id: 0, name: language === 'pt' ? 'Você' : 'You', stack: 1000, initialStack: 1000, bet: 0, cards: [{ r: 'A', s: '♥', c: 'red' }, { r: 'J', s: '♣', c: 'black' }], x: 200, y: 420, isWinner: false, role: 'BTN', action: '' },
      { id: 1, name: 'Bot Rafael', stack: 850, initialStack: 850, bet: 0, cards: [{ r: '10', s: '♦', c: 'red' }, { r: '9', s: '♦', c: 'red' }], x: 60, y: 325, isWinner: false, role: 'SB', action: '' },
      { id: 2, name: 'Bot Sophia', stack: 1200, initialStack: 1200, bet: 0, cards: [{ r: 'Q', s: '♦', c: 'red' }, { r: 'K', s: '♠', c: 'black' }], x: 60, y: 175, isWinner: false, role: 'BB', action: '' },
      { id: 3, name: 'Bot Lucas', stack: 950, initialStack: 950, bet: 0, cards: [{ r: '2', s: '♠', c: 'black' }, { r: '7', s: '♥', c: 'red' }], x: 200, y: 80, isWinner: false, role: 'UTG', action: '' },
      { id: 4, name: 'Bot Isabella', stack: 1100, initialStack: 1100, bet: 0, cards: [{ r: '6', s: '♣', c: 'black' }, { r: '5', s: '♣', c: 'black' }], x: 340, y: 175, isWinner: false, role: 'HJ', action: '' },
      { id: 5, name: 'Bot Gabriel', stack: 700, initialStack: 700, bet: 0, cards: [{ r: 'A', s: '♠', c: 'black' }, { r: 'J', s: '♦', c: 'red' }], x: 340, y: 325, isWinner: false, role: 'CO', action: '' }
    ];

    const communityCards = [
      { r: 'Q', s: '♣', c: 'black', visible: false },
      { r: 'Q', s: '♠', c: 'black', visible: false },
      { r: '2', s: '♣', c: 'black', visible: false },
      { r: '6', s: '♥', c: 'red', visible: false },
      { r: '6', s: '♠', c: 'black', visible: false }
    ];

    let pot = 0;
    let turnIndex = 1; // starts at SB (1)
    let cardAnimationProgress = 0; // dealing animation progress
    let chipAnimationProgress = 0; // chip movement progress
    let chipSourceX = 0, chipSourceY = 0;
    let winnerText = '';

    const resetSim = () => {
      simPhase = 1;
      phaseTimer = 0;
      pot = 0;
      turnIndex = 1;
      cardAnimationProgress = 0;
      chipAnimationProgress = 0;
      winnerText = '';
      players.forEach(p => {
        p.stack = p.initialStack;
        p.bet = 0;
        p.isWinner = false;
        p.action = '';
      });
      communityCards.forEach(c => c.visible = false);
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Deep Emerald felt background
      const feltGrad = ctx.createRadialGradient(200, 250, 50, 200, 250, 300);
      feltGrad.addColorStop(0, '#065f46');
      feltGrad.addColorStop(0.6, '#042f1a');
      feltGrad.addColorStop(1, '#0e1210');
      ctx.fillStyle = feltGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Felt grid texture representation
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // 2. Draw Table Ellipse
      // Shadow border
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 15;
      
      // Soft Gold outer rail border
      ctx.strokeStyle = '#DEB887';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(200, 250, 140, 180, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = 'transparent'; // reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Dark inner wood boundary
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(200, 250, 134, 174, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Table felt boundary
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(200, 250, 126, 166, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner elegant ring line
      ctx.strokeStyle = 'rgba(222, 184, 135, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(200, 250, 100, 135, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw Pot Info
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(140, 160, 120, 30, 15);
      ctx.fill();
      ctx.strokeStyle = 'rgba(222, 184, 135, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pot Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${language === 'pt' ? 'POTE' : 'POT'}: $${Math.floor(pot)}`, 200, 179);

      // 4. Draw Community Cards (Center board)
      const startCardX = 120;
      const cardY = 220;
      const cardW = 26;
      const cardH = 38;
      const cardGap = 6;

      for (let i = 0; i < 5; i++) {
        const cX = startCardX + i * (cardW + cardGap);
        const card = communityCards[i];

        if (card.visible) {
          // Draw face up card
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cX, cardY, cardW, cardH, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Symbol suit
          ctx.fillStyle = card.c === 'red' ? '#dc2626' : '#1e293b';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(card.r, cX + 8, cardY + 12);
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(card.s, cX + cardW / 2, cardY + 28);
        } else {
          // Draw face down / empty placeholder slot
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.roundRect(cX, cardY, cardW, cardH, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(222, 184, 135, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 5. Draw Player Seats
      players.forEach((player, idx) => {
        const isCurrentTurn = idx === turnIndex && (simPhase === 2 || simPhase === 5);
        
        // Active Turn pulse ring
        if (isCurrentTurn) {
          ctx.strokeStyle = '#98D8BA';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(player.x, player.y, 25 + Math.sin(frame * 0.15) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Seat container background
        ctx.fillStyle = player.isWinner ? 'rgba(222, 184, 135, 0.15)' : 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = player.isWinner ? '#DEB887' : (isCurrentTurn ? '#98D8BA' : 'rgba(222, 184, 135, 0.25)');
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Player Initial letter
        ctx.fillStyle = player.isWinner ? '#DEB887' : '#ffffff';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.name.charAt(0).toUpperCase(), player.x, player.y - 1);

        // Player Name & Stack Info (Badge below avatar)
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeStyle = player.isWinner ? '#DEB887' : 'rgba(222, 184, 135, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(player.x - 35, player.y + 14, 70, 24, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(player.id === 0 ? (language === 'pt' ? 'Você' : 'You') : player.name, player.x, player.y + 23);
        ctx.fillStyle = '#98D8BA';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(`$${Math.floor(player.stack)}`, player.x, player.y + 33);

        // Role (D, SB, BB)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(player.x + 18, player.y - 12, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#064e3b';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.fillText(player.role, player.x + 18, player.y - 10);

        // Speech Bubble / action
        if (player.action) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(player.x - 30, player.y - 45, 60, 16, 6);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(player.x - 5, player.y - 29);
          ctx.lineTo(player.x, player.y - 24);
          ctx.lineTo(player.x + 5, player.y - 29);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.fillText(player.action, player.x, player.y - 34);
        }

        // Cards Deal Animation
        if (simPhase === 1) {
          const t = Math.min(1, cardAnimationProgress);
          // Interpolate from center to player position
          const c1X = 200 + (player.x - 10 - 200) * t;
          const c1Y = 250 + (player.y - 30 - 250) * t;
          const c2X = 200 + (player.x + 10 - 200) * t;
          const c2Y = 250 + (player.y - 30 - 250) * t;

          // Draw mock cards (facedown red/blue backs)
          ctx.fillStyle = '#1e3a8a';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(c1X - 8, c1Y - 12, 16, 24, 3);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.roundRect(c2X - 8, c2Y - 12, 16, 24, 3);
          ctx.fill();
          ctx.stroke();
        } else if (simPhase > 1) {
          // Draw cards next to seat
          const showFaceUp = player.id === 0 || (simPhase >= 6 && (player.id === 5 || player.id === 0));
          
          for (let cIdx = 0; cIdx < 2; cIdx++) {
            const cardX = player.x - 14 + cIdx * 18;
            const cardY = player.y - 32;

            if (showFaceUp) {
              const card = player.cards[cIdx];
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(cardX - 8, cardY - 12, 16, 24, 3);
              ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.15)';
              ctx.stroke();

              ctx.fillStyle = card.c === 'red' ? '#dc2626' : '#0f172a';
              ctx.font = 'bold 8px Inter, sans-serif';
              ctx.fillText(card.r, cardX - 3, cardY - 2);
              ctx.font = '9px Inter, sans-serif';
              ctx.fillText(card.s, cardX, cardY + 7);
            } else {
              ctx.fillStyle = '#1e40af';
              ctx.beginPath();
              ctx.roundRect(cardX - 8, cardY - 12, 16, 24, 3);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
            }
          }
        }
      });

      // 6. Draw Betting Chips Animation
      if (chipAnimationProgress > 0 && chipAnimationProgress < 1) {
        const t = chipAnimationProgress;
        const currentChipX = chipSourceX + (200 - chipSourceX) * t;
        const currentChipY = chipSourceY + (250 - chipSourceY) * t;

        // Draw small gold 3D chip
        ctx.fillStyle = '#DEB887';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(currentChipX, currentChipY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(currentChipX, currentChipY, 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Showdown overlay banner
      if (simPhase === 6 || simPhase === 7) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 230, canvas.width, 45);

        ctx.fillStyle = '#DEB887';
        ctx.font = 'black 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(winnerText, 200, 248);
        ctx.fillStyle = '#98D8BA';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(language === 'pt' ? 'DOIS PARES DE RAINHAS E SEIS (DIVIDIDO)' : 'TWO PAIRS, QUEENS AND SIXES (SPLIT)', 200, 264);
      }

      frame++;
    };

    const updateSimulation = () => {
      phaseTimer++;

      switch (simPhase) {
        case 1: // Dealing cards anim
          cardAnimationProgress += 0.05;
          if (phaseTimer > 40) {
            simPhase = 2; // Pre-flop betting
            phaseTimer = 0;
            turnIndex = 1; // start acting
          }
          break;

        case 2: // Pre-flop betting actions
          if (phaseTimer === 1) {
            // Player acts
            if (turnIndex === 1) {
              players[1].action = 'CALL $20';
              chipSourceX = players[1].x;
              chipSourceY = players[1].y;
              chipAnimationProgress = 0.01;
            } else if (turnIndex === 2) {
              players[2].action = 'CHECK';
            } else if (turnIndex === 5) {
              players[5].action = 'CALL $20';
              chipSourceX = players[5].x;
              chipSourceY = players[5].y;
              chipAnimationProgress = 0.01;
            } else if (turnIndex === 0) {
              players[0].action = 'CALL $20';
              chipSourceX = players[0].x;
              chipSourceY = players[0].y;
              chipAnimationProgress = 0.01;
            }
          }

          if (chipAnimationProgress > 0 && chipAnimationProgress < 1) {
            chipAnimationProgress += 0.08;
          } else if (chipAnimationProgress >= 1) {
            // update stacks/pot
            players[turnIndex].stack -= 20;
            pot += 20;
            chipAnimationProgress = 0;
          }

          if (phaseTimer > 35) {
            // Clear actions and go next
            players[turnIndex].action = '';
            phaseTimer = 0;

            if (turnIndex === 1) turnIndex = 2;
            else if (turnIndex === 2) turnIndex = 5;
            else if (turnIndex === 5) turnIndex = 0;
            else if (turnIndex === 0) {
              // all acted preflop
              simPhase = 3; // Deal Flop
              turnIndex = -1;
            }
          }
          break;

        case 3: // Deal Flop
          if (phaseTimer === 5) communityCards[0].visible = true;
          if (phaseTimer === 15) communityCards[1].visible = true;
          if (phaseTimer === 25) communityCards[2].visible = true;
          if (phaseTimer > 50) {
            simPhase = 4; // Flop betting actions
            phaseTimer = 0;
            turnIndex = 2; // SB folded, BB checks first
          }
          break;

        case 4: // Flop action
          if (phaseTimer === 1) {
            players[2].action = 'CHECK';
          } else if (phaseTimer === 15) {
            players[5].action = 'CHECK';
          } else if (phaseTimer === 30) {
            players[0].action = 'CHECK';
          }

          if (phaseTimer > 45) {
            players[2].action = '';
            players[5].action = '';
            players[0].action = '';
            simPhase = 5; // Deal Turn
            phaseTimer = 0;
          }
          break;

        case 5: // Deal Turn
          if (phaseTimer === 10) communityCards[3].visible = true;
          if (phaseTimer > 30) {
            simPhase = 6; // Deal River
            phaseTimer = 0;
          }
          break;

        case 6: // Deal River
          if (phaseTimer === 10) communityCards[4].visible = true;
          if (phaseTimer > 40) {
            simPhase = 7; // Showdown
            phaseTimer = 0;
            winnerText = language === 'pt' ? 'DIVIDIDO: VOCÊ E BOT GABRIEL' : 'SPLIT: YOU AND BOT GABRIEL';
            players[0].isWinner = true;
            players[5].isWinner = true;
          }
          break;

        case 7: // Showdown display
          if (phaseTimer > 120) {
            simPhase = 8; // Pot distribution/Reset
            phaseTimer = 0;
          }
          break;

        case 8: // reset
          resetSim();
          break;
      }
    };

    const loop = () => {
      updateSimulation();
      render();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="min-h-screen bg-[#022c22] text-[#f8fafc] flex flex-col font-sans overflow-x-hidden relative">
      {/* Premium background felt gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_100%_100%,rgba(222,184,135,0.06),transparent_50%)] pointer-events-none z-0" />

      {/* Elegant Top Header / Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#DEB887]/10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DEB887]/30 shadow-md">
            <img src="/logo/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-black uppercase tracking-wider text-sm bg-gradient-to-r from-white to-[#DEB887] bg-clip-text text-transparent">
            Poker Hold'em
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-black/35 border border-white/5 rounded-full p-0.5 shadow-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                language === 'en'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                language === 'pt'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              PT
            </button>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="bg-white/5 border border-[#DEB887]/20 hover:bg-[#DEB887]/15 hover:border-[#DEB887]/40 text-[#DEB887] px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider"
          >
            {language === 'pt' ? 'Acessar Club' : 'Access Club'}
          </button>
        </div>
      </header>

      {/* 1. Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center gap-12 z-10">
        <div className="text-center max-w-3xl flex flex-col items-center gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 bg-[#98D8BA]/10 border border-[#98D8BA]/20 rounded-full px-3 py-1 text-[#98D8BA] text-[10px] font-black uppercase tracking-widest"
          >
            <Sparkles size={12} />
            VIP Poker Club Online
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white"
          >
            {language === 'pt' ? 'O Esporte da Mente' : 'The Mind Sport'}<br />
            <span className="bg-gradient-to-r from-[#98D8BA] via-[#DEB887] to-[#98D8BA] bg-clip-text text-transparent bg-[size:200%] animate-[shimmer_5s_infinite_linear]">
              Mobile-First
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-sm sm:text-lg max-w-xl leading-relaxed"
          >
            {t('landingHeroText')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <button 
              onClick={() => navigate('/login')}
              className="w-48 h-14 bg-[#98D8BA] text-[#121513] font-black uppercase text-sm rounded-full shadow-lg shadow-emerald-400/20 active:scale-98 hover:bg-[#86c7a9] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              {t('playNow')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Bento Grid: Live Game Simulation (Canvas) & Metrics */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
          
          {/* Main Card (Live Simulated Canvas) */}
          <div className="lg:col-span-7 bg-[#064e3b]/30 border border-[#DEB887]/15 rounded-[32px] p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl relative overflow-hidden group">
            {/* Soft gold decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#DEB887]/20 rounded-tl-[32px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#DEB887]/20 rounded-br-[32px] pointer-events-none" />

            <div className="flex items-center justify-between z-10 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#98D8BA] animate-pulse" />
                <h3 className="font-black uppercase tracking-wider text-xs text-white">{t('simulationTitle')}</h3>
              </div>
              <span className="text-[10px] text-white/40 font-mono">{language === 'pt' ? 'Loop de Demonstração' : 'Demo Loop'}</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 relative bg-black/10 rounded-2xl border border-white/5 shadow-inner">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={500} 
                className="w-full max-w-[340px] aspect-[4/5] object-contain block rounded-xl overflow-hidden"
              />
            </div>
          </div>

          {/* Right Side Bento Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card 1: Active Rooms & Online Status */}
            <div className="bg-[#064e3b]/30 border border-[#DEB887]/15 rounded-[32px] p-6 backdrop-blur-md flex flex-col justify-between shadow-lg relative min-h-[160px]">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#98D8BA]/10 rounded-2xl text-[#98D8BA] border border-[#98D8BA]/15">
                  <Cpu size={20} />
                </div>
                <span className="text-[9px] font-black uppercase text-[#98D8BA] bg-[#98D8BA]/10 px-2 py-0.5 rounded-full border border-[#98D8BA]/20">{language === 'pt' ? 'RNG Garantido' : 'Guaranteed RNG'}</span>
              </div>
              <div className="mt-4">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{language === 'pt' ? 'Estado da Rede' : 'Network State'}</p>
                <div className="flex items-baseline gap-4 mt-1">
                  <h4 className="text-3xl font-black text-white font-mono">{onlinePlayers}</h4>
                  <span className="text-white/50 text-xs font-bold">{language === 'pt' ? 'Jogadores Ativos' : 'Active Players'}</span>
                </div>
                <div className="flex items-baseline gap-4 mt-0.5">
                  <h4 className="text-2xl font-black text-[#DEB887] font-mono">{activeTables}</h4>
                  <span className="text-white/40 text-[10px] font-bold">{language === 'pt' ? 'Salas de Bots online' : 'Online Bot Rooms'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Simulated Chart of Progression */}
            <div className="bg-[#064e3b]/30 border border-[#DEB887]/15 rounded-[32px] p-6 backdrop-blur-md flex flex-col justify-between shadow-lg relative min-h-[180px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#DEB887]" />
                  <span className="font-black uppercase tracking-wider text-[10px] text-white">{language === 'pt' ? 'Evolução do Bankroll' : 'Bankroll Evolution'}</span>
                </div>
                <span className="text-[9px] font-bold font-mono text-[#98D8BA]">+142%</span>
              </div>
              
              {/* Modern elegant SVG line chart */}
              <div className="w-full h-20 my-2 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#98D8BA" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#98D8BA" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <path 
                    d="M0 40 Q20 30, 35 34 T65 18 T100 6 L100 40 Z" 
                    fill="url(#chartGrad)" 
                  />
                  {/* Chart line */}
                  <path 
                    d="M0 40 Q20 30, 35 34 T65 18 T100 6" 
                    fill="none" 
                    stroke="#98D8BA" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  {/* Glowing end point */}
                  <circle cx="100" cy="6" r="2.5" fill="#98D8BA" className="animate-pulse" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] text-white/50 leading-tight">
                  {language === 'pt' 
                    ? 'Bots de IA simulam comportamento real, testando suas habilidades e maximizando sua banca.' 
                    : 'AI bots simulate real behavior, testing your skills and maximizing your bankroll.'}
                </p>
              </div>
            </div>

            {/* Card 3: Security Certifications */}
            <div className="bg-[#064e3b]/30 border border-[#DEB887]/15 rounded-[32px] p-6 backdrop-blur-md flex flex-col justify-between shadow-lg relative min-h-[150px]">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[#DEB887]/10 rounded-2xl text-[#DEB887] border border-[#DEB887]/15">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[8px] font-black uppercase text-[#DEB887] border border-[#DEB887]/30 px-2 py-0.5 rounded">{language === 'pt' ? 'RNG Certificado' : 'Certified RNG'}</span>
              </div>
              <div className="mt-4">
                <h4 className="font-black text-xs text-white uppercase mb-1">{language === 'pt' ? 'Mesa 100% Justa' : '100% Fair Table'}</h4>
                <p className="text-[10px] text-white/50 leading-tight">
                  {language === 'pt'
                    ? 'Nosso embaralhamento de cartas utiliza criptografia e sementes aleatórias livres de manipulação.'
                    : 'Our card shuffling utilizes encryption and random seeds free of manipulation.'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: COMO FUNCIONAM OS CRÉDITOS (CREDITS FLOW SIMULATOR) */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 border-t border-[#DEB887]/15">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#DEB887]">
              <Sparkles size={16} />
              <span className="font-black uppercase tracking-wider text-xs">{language === 'pt' ? 'Sistema de Fichas Reais' : 'Real Chips System'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              {language === 'pt' ? 'Como Funcionam os' : 'How Do'}<br />
              <span className="text-[#98D8BA]">{language === 'pt' ? 'Créditos no Jogo?' : 'In-game Credits Work?'}</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {language === 'pt'
                ? 'O saldo do seu Club é dividido de forma inteligente e segura entre a sua Carteira Principal e o seu Stack ativo de jogo.'
                : 'Your Club balance is split intelligently and securely between your Main Wallet and active Table Stack.'}
            </p>
            
            <div className="flex flex-col gap-4 mt-2">
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${creditSimStep === 0 ? 'bg-[#98D8BA]/10 border-[#98D8BA]/35' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <h4 className="font-bold text-xs uppercase text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</span>
                  {t('buyinLabel')}
                </h4>
                <p className="text-[10px] text-white/50 pl-7 mt-1">{t('buyinDesc')}</p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all duration-300 ${creditSimStep === 1 || creditSimStep === 2 ? 'bg-[#98D8BA]/10 border-[#98D8BA]/35' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <h4 className="font-bold text-xs uppercase text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
                  {language === 'pt' ? 'Disputa e Dinâmica de Fichas' : 'Wagers & Chip Dynamics'}
                </h4>
                <p className="text-[10px] text-white/50 pl-7 mt-1">{t('stackDesc')}</p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all duration-300 ${creditSimStep === 3 ? 'bg-[#98D8BA]/10 border-[#98D8BA]/35' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <h4 className="font-bold text-xs uppercase text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">3</span>
                  {language === 'pt' ? 'Retorno Seguro e Lucros' : 'Secure Cash-out & Profits'}
                </h4>
                <p className="text-[10px] text-white/50 pl-7 mt-1">{t('cashoutDesc')}</p>
              </div>
            </div>
          </div>

          {/* Interactive Flow Visualizer (Simulated Screen) */}
          <div className="bg-[#064e3b]/20 border border-[#DEB887]/15 rounded-[32px] p-6 backdrop-blur-md flex flex-col gap-6 shadow-xl relative min-h-[340px] justify-center">
            {/* Soft gold decorative corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#DEB887]/20 rounded-tl-[32px]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#DEB887]/20 rounded-br-[32px]" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{language === 'pt' ? 'Simulador de Transição' : 'Transition Simulator'}</span>
              <span className="bg-[#98D8BA]/10 text-[#98D8BA] text-[8px] font-black px-2 py-0.5 rounded border border-[#98D8BA]/20 uppercase">{language === 'pt' ? 'Tempo Real' : 'Real Time'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Wallet Card */}
              <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                <span className="text-[8px] font-black uppercase tracking-wider text-white/30">{t('walletLabel')}</span>
                <div className="text-xl font-mono font-black text-[#DEB887]">
                  ${creditSimStep === 0 ? '2.500' : creditSimStep === 1 || creditSimStep === 2 ? '1.500' : '3.300'}
                </div>
                {creditSimStep === 3 && (
                  <span className="absolute right-2 bottom-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded animate-bounce">
                    +$1.800
                  </span>
                )}
              </div>

              {/* Table Stack Card */}
              <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                <span className="text-[8px] font-black uppercase tracking-wider text-white/30">{t('stackTitle')}</span>
                <div className="text-xl font-mono font-black text-[#98D8BA]">
                  ${creditSimStep === 0 ? '0' : creditSimStep === 1 ? '1.000' : creditSimStep === 2 ? '1.800' : '0'}
                </div>
                {creditSimStep === 2 && (
                  <span className="absolute right-2 bottom-2 bg-[#98D8BA]/20 text-[#98D8BA] border border-[#98D8BA]/30 text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse">
                    {language === 'pt' ? 'Vitória! +$800' : 'Win! +$800'}
                  </span>
                )}
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#98D8BA] animate-ping" />
              <div className="flex-1 text-[10px] text-white/60 font-medium h-8 flex items-center">
                {creditSimStep === 0 && (language === 'pt' ? "Preparando buy-in... carteira principal com $2.500." : "Preparing buy-in... main wallet has $2,500.")}
                {creditSimStep === 1 && (language === 'pt' ? "Entrou no jogo! Compra de $1.000 fichas realizada com sucesso." : "Entered game! $1,000 buy-in successfully completed.")}
                {creditSimStep === 2 && (language === 'pt' ? "Partida em andamento: Seu stack subiu para $1.800 após vencer a rodada." : "Game in progress: Your stack increased to $1,800 after winning the round.")}
                {creditSimStep === 3 && (language === 'pt' ? "Saiu da mesa: $1.800 foram devolvidos integralmente. Lucro de +$800!" : "Left table: $1,800 returned in full. Net profit: +$800!")}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: REPOSIÇÃO E LIMITES (RECHARGE & LIMITS SHOWCASE) */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 border-t border-[#DEB887]/15">
          {/* Simulated Smartphone Screen (Left side) */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="w-[230px] h-[440px] bg-[#121513] rounded-[36px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col z-10">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-black/60" />
              </div>

              {/* Simulated UI Header */}
              <div className="pt-6 px-4 pb-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase text-[#DEB887] tracking-widest">{language === 'pt' ? 'Hold\'em Recarga' : 'Hold\'em Reload'}</span>
                <span className="text-[7px] font-bold font-mono text-white/50">{language === 'pt' ? 'Saldo' : 'Balance'}: ${reloadStep === 2 ? '5.000' : '0'}</span>
              </div>

              {/* Simulated UI Content */}
              <div className="flex-1 p-4 flex flex-col items-center justify-between text-center gap-2">
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase">{language === 'pt' ? 'QR Code Temporário' : 'Temporary QR Code'}</h4>
                  <p className="text-[8px] text-white/40 leading-tight">{language === 'pt' ? 'Escaneie para adicionar créditos' : 'Scan to add credits'}</p>
                </div>

                {/* QR Code Container */}
                <div className="w-32 h-32 bg-white p-2.5 rounded-xl relative shadow-lg flex items-center justify-center overflow-hidden">
                  {/* Mock QR Code Pattern */}
                  <div className="w-full h-full bg-slate-100 flex flex-col gap-0.5 p-0.5 rounded border border-slate-200 justify-between">
                    {[...Array(6)].map((_, rIdx) => (
                      <div key={rIdx} className="flex justify-between w-full h-full gap-0.5">
                        {[...Array(6)].map((_, cIdx) => (
                          <div 
                            key={cIdx} 
                            className={`w-full h-full rounded-sm ${
                              (rIdx === 0 && cIdx === 0) || (rIdx === 0 && cIdx === 5) || (rIdx === 5 && cIdx === 0) ||
                              ((rIdx + cIdx) % 3 === 0 && (rIdx !== 2 || cIdx !== 2))
                                ? 'bg-slate-900' 
                                : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Scanning Laser Line */}
                  {reloadStep === 1 && (
                    <div className="absolute left-0 w-full h-0.5 bg-[#98D8BA] shadow-[0_0_8px_rgba(152,216,186,0.8)] animate-scan" />
                  )}

                  {/* Success checkmark overlay */}
                  {reloadStep === 2 && (
                    <div className="absolute inset-0 bg-[#064e3b]/95 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-[#98D8BA] flex items-center justify-center text-[#121513] mb-1.5 shadow-lg shadow-emerald-400/20">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase">{language === 'pt' ? 'Autorizado!' : 'Authorized!'}</span>
                      <span className="text-[8px] text-[#98D8BA] font-black font-mono">{language === 'pt' ? '+$5.000 FICHAS' : '+$5,000 CHIPS'}</span>
                    </div>
                  )}
                </div>

                {/* Countdown Timer */}
                <div className="flex flex-col items-center gap-0.5 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full w-full">
                  <span className="text-[7px] text-white/40 uppercase font-black tracking-wider">{language === 'pt' ? 'Expira em' : 'Expires in'}</span>
                  <span className="text-[10px] font-mono font-bold text-rose-400">{formatTime(reloadSeconds)}</span>
                </div>

                {/* Status Message */}
                <div className="text-[8px] text-white/50 font-bold bg-black/35 py-1 px-3 rounded-lg w-full h-7 flex items-center justify-center">
                  {reloadStep === 0 && (language === 'pt' ? "Aguardando leitura do QR Code..." : "Waiting for QR Code scan...")}
                  {reloadStep === 1 && (language === 'pt' ? "Processando autorização..." : "Processing authorization...")}
                  {reloadStep === 2 && (language === 'pt' ? "Transação aprovada com sucesso!" : "Transaction successfully approved!")}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Text (Right side) */}
          <div className="flex flex-col gap-6 order-1 md:order-2">
            <div className="flex items-center gap-2 text-[#98D8BA]">
              <Zap size={16} />
              <span className="font-black uppercase tracking-wider text-xs">{language === 'pt' ? 'Reposição Rápida e Justa' : 'Fast & Fair Refills'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              {language === 'pt' ? 'Aquisição de Créditos e' : 'Credit Acquisition &'}<br />
              <span className="text-[#DEB887]">{language === 'pt' ? 'Limites de Proteção' : 'Protection Limits'}</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {language === 'pt'
                ? 'Adquira novos créditos de forma instantânea via Pix/QR Code para voltar à ação com total controle sobre o seu saldo.'
                : 'Acquire new credits instantly via Pix/QR Code to get back in the action with full control over your balance.'}
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#DEB887]/10 rounded-xl text-[#DEB887] shrink-0 border border-[#DEB887]/15">
                  <Award size={16} />
                </div>
                <div>
                  <h5 className="font-black text-xs text-white uppercase mb-0.5">{language === 'pt' ? '3 Recargas a cada 4 Horas' : '3 Refills every 4 Hours'}</h5>
                  <p className="text-[10px] text-white/40 leading-tight">{t('limitsDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#98D8BA]/10 rounded-xl text-[#98D8BA] shrink-0 border border-[#98D8BA]/15">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h5 className="font-black text-xs text-white uppercase mb-0.5">{language === 'pt' ? 'Até $5.000 Fichas por Ciclo' : 'Up to $5,000 Chips per Cycle'}</h5>
                  <p className="text-[10px] text-white/40 leading-tight">{t('refillsDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#DEB887]/10 rounded-xl text-[#DEB887] shrink-0 border border-[#DEB887]/15">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h5 className="font-black text-xs text-white uppercase mb-0.5">{language === 'pt' ? 'QR Code Exclusivo de 5 Minutos' : 'Exclusive 5-Minute QR Code'}</h5>
                  <p className="text-[10px] text-white/40 leading-tight">{language === 'pt' ? 'Os links de recarga são gerados instantaneamente e expiram por segurança para evitar uso duplicado.' : 'Recharge links are generated instantly and expire for security to prevent duplicate usage.'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features list strip */}
        <div className="w-full py-6 mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#DEB887]/10">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#DEB887]">{language === 'pt' ? 'Rápido & Leve' : 'Fast & Light'}</h5>
            <p className="text-[10px] text-white/40 leading-tight">{language === 'pt' ? 'Jogue sem precisar baixar nada na loja.' : 'Play without downloading anything from the app store.'}</p>
          </div>
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#98D8BA]">{language === 'pt' ? 'Design Vertical' : 'Vertical Design'}</h5>
            <p className="text-[10px] text-white/40 leading-tight">{language === 'pt' ? 'UI otimizada para ser jogada com uma mão.' : 'UI optimized to be played with just one hand.'}</p>
          </div>
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#DEB887]">{language === 'pt' ? 'Bots Avançados' : 'Advanced Bots'}</h5>
            <p className="text-[10px] text-white/40 leading-tight">{language === 'pt' ? 'Oponentes virtuais com timing e blefe realistas.' : 'Virtual opponents with realistic timing and bluffing.'}</p>
          </div>
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#98D8BA]">{language === 'pt' ? 'PWA Pronto' : 'PWA Ready'}</h5>
            <p className="text-[10px] text-white/40 leading-tight">{language === 'pt' ? 'Instalação 100% gratuita na tela inicial do seu celular.' : '100% free installation on your mobile home screen.'}</p>
          </div>
        </div>

        {/* 4. Bottom CTA Section */}
        <section className="w-full max-w-md mx-auto text-center py-16 flex flex-col items-center gap-6 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight">
            {t('readyToSeat')}
          </h3>
          <p className="text-white/50 text-xs max-w-sm leading-relaxed">
            {language === 'pt'
              ? 'Faça login com sua conta Google, ganhe fichas fictícias e comece a disputar rodadas agora mesmo contra nossos robôs.'
              : 'Sign in with your Google account, claim play chips, and start playing rounds right now against our robots.'}
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-56 h-16 bg-[#98D8BA] text-[#121513] font-black uppercase text-sm rounded-full shadow-xl shadow-emerald-500/20 active:scale-98 hover:bg-[#86c7a9] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            {language === 'pt' ? 'Entrar no Club' : 'Enter the Club'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-white/30 text-[10px] border-t border-[#DEB887]/10 z-10">
        <p>
          {language === 'pt'
            ? '© 2026 Poker Hold\'em Premium Club. Todos os direitos reservados.'
            : '© 2026 Poker Hold\'em Premium Club. All rights reserved.'}
        </p>
        <p className="mt-1 text-white/20">
          {language === 'pt'
            ? 'Desenvolvido com foco em acessibilidade e performance mobile.'
            : 'Developed with a focus on accessibility and mobile performance.'}
        </p>
      </footer>
    </div>
  );
}
