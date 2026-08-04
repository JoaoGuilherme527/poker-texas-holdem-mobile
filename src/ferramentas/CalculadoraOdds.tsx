import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, HelpCircle, ChevronDown, Award, Percent } from 'lucide-react';
import { CardData, Suit, Rank } from '../types';
import { Card } from '../components/Card';
import { cardToString, createDeck } from '../lib/pokerUtils';
import { Hand } from 'pokersolver';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

interface EquityResult {
  p1Win: number;
  p2Win: number;
  tie: number;
  simulations: number;
}

export default function CalculadoraOdds() {
  const navigate = useNavigate();

  // Slots state
  const [p1Cards, setP1Cards] = useState<[CardData | null, CardData | null]>([null, null]);
  const [p2Cards, setP2Cards] = useState<[CardData | null, CardData | null]>([null, null]);
  const [boardCards, setBoardCards] = useState<[CardData | null, CardData | null, CardData | null, CardData | null, CardData | null]>([
    null, null, null, null, null
  ]);

  // Active slot selection tracker
  const [activeSlot, setActiveSlot] = useState<{ type: 'p1' | 'p2' | 'board'; index: number } | null>({
    type: 'p1',
    index: 0
  });

  const [result, setResult] = useState<EquityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // FAQ open state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false
  });

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Helper to check if a card is selected
  const isCardSelected = (rank: Rank, suit: Suit): boolean => {
    const check = (c: CardData | null) => c && c.rank === rank && c.suit === suit;
    return (
      p1Cards.some(check) ||
      p2Cards.some(check) ||
      boardCards.some(check)
    );
  };

  // Select a card
  const handleSelectCard = (rank: Rank, suit: Suit) => {
    if (!activeSlot) return;

    const selectedCard: CardData = { rank, suit };

    if (isCardSelected(rank, suit)) {
      // Remove card if clicked again
      handleRemoveCard(activeSlot.type, activeSlot.index);
      return;
    }

    if (activeSlot.type === 'p1') {
      const newP1 = [...p1Cards] as [CardData | null, CardData | null];
      newP1[activeSlot.index] = selectedCard;
      setP1Cards(newP1);
      // Auto advance slot
      if (activeSlot.index === 0) {
        setActiveSlot({ type: 'p1', index: 1 });
      } else {
        setActiveSlot({ type: 'p2', index: 0 });
      }
    } else if (activeSlot.type === 'p2') {
      const newP2 = [...p2Cards] as [CardData | null, CardData | null];
      newP2[activeSlot.index] = selectedCard;
      setP2Cards(newP2);
      // Auto advance slot
      if (activeSlot.index === 0) {
        setActiveSlot({ type: 'p2', index: 1 });
      } else {
        setActiveSlot({ type: 'board', index: 0 });
      }
    } else {
      const newBoard = [...boardCards] as [CardData | null, CardData | null, CardData | null, CardData | null, CardData | null];
      newBoard[activeSlot.index] = selectedCard;
      setBoardCards(newBoard);
      // Auto advance slot
      if (activeSlot.index < 4) {
        setActiveSlot({ type: 'board', index: activeSlot.index + 1 });
      } else {
        setActiveSlot(null);
      }
    }
  };

  // Remove card from slot
  const handleRemoveCard = (type: 'p1' | 'p2' | 'board', index: number) => {
    if (type === 'p1') {
      const newP1 = [...p1Cards] as [CardData | null, CardData | null];
      newP1[index] = null;
      setP1Cards(newP1);
    } else if (type === 'p2') {
      const newP2 = [...p2Cards] as [CardData | null, CardData | null];
      newP2[index] = null;
      setP2Cards(newP2);
    } else {
      const newBoard = [...boardCards] as [CardData | null, CardData | null, CardData | null, CardData | null, CardData | null];
      newBoard[index] = null;
      setBoardCards(newBoard);
    }
    setActiveSlot({ type, index });
  };

  // Clear all selections
  const handleClearAll = () => {
    setP1Cards([null, null]);
    setP2Cards([null, null]);
    setBoardCards([null, null, null, null, null]);
    setResult(null);
    setActiveSlot({ type: 'p1', index: 0 });
  };

  // Trigger calculation when player hands are complete
  useEffect(() => {
    const isP1Complete = p1Cards[0] !== null && p1Cards[1] !== null;
    const isP2Complete = p2Cards[0] !== null && p2Cards[1] !== null;

    if (!isP1Complete || !isP2Complete) {
      setResult(null);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      calculateEquity();
    }, 100);

    return () => clearTimeout(timer);
  }, [p1Cards, p2Cards, boardCards]);

  const calculateEquity = () => {
    const p1Valid = p1Cards.filter(Boolean) as CardData[];
    const p2Valid = p2Cards.filter(Boolean) as CardData[];
    const boardValid = boardCards.filter(Boolean) as CardData[];

    if (p1Valid.length < 2 || p2Valid.length < 2) return;

    // Create full deck minus selected cards
    const selectedStrings = new Set([
      ...p1Valid.map(cardToString),
      ...p2Valid.map(cardToString),
      ...boardValid.map(cardToString)
    ]);

    const fullDeck: string[] = [];
    SUITS.forEach(s => {
      RANKS.forEach(r => {
        const cStr = cardToString({ rank: r, suit: s });
        if (!selectedStrings.has(cStr)) {
          fullDeck.push(cStr);
        }
      });
    });

    const p1Hole = p1Valid.map(cardToString);
    const p2Hole = p2Valid.map(cardToString);
    const knownBoard = boardValid.map(cardToString);

    let p1Wins = 0;
    let p2Wins = 0;
    let ties = 0;
    const SIM_COUNT = 1000;

    // Simple Monte Carlo simulation
    for (let sim = 0; sim < SIM_COUNT; sim++) {
      // Shuffle/Draw remaining board cards
      const tempDeck = [...fullDeck];
      const neededBoardCards = 5 - knownBoard.length;
      const simBoard = [...knownBoard];

      for (let k = 0; k < neededBoardCards; k++) {
        const randIdx = Math.floor(Math.random() * tempDeck.length);
        simBoard.push(tempDeck.splice(randIdx, 1)[0]);
      }

      // Solve hands
      try {
        const p1Solved = Hand.solve([...p1Hole, ...simBoard]);
        const p2Solved = Hand.solve([...p2Hole, ...simBoard]);
        const winners = Hand.winners([p1Solved, p2Solved]);

        if (winners.length === 2) {
          ties++;
        } else if (winners[0] === p1Solved) {
          p1Wins++;
        } else {
          p2Wins++;
        }
      } catch (err) {
        console.error("Solver error in sim", err);
      }
    }

    setResult({
      p1Win: (p1Wins / SIM_COUNT) * 100,
      p2Win: (p2Wins / SIM_COUNT) * 100,
      tie: (ties / SIM_COUNT) * 100,
      simulations: SIM_COUNT
    });
    setIsCalculating(false);
  };

  const suitSymbols: Record<Suit, string> = {
    spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣'
  };

  return (
    <div className="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans overflow-x-hidden relative pb-10">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-[radial-gradient(circle_at_50%_0%,rgba(152,216,186,0.15),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_100%_100%,rgba(222,184,135,0.05),transparent_50%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-black uppercase tracking-wider text-xs bg-gradient-to-r from-white to-[#DEB887] bg-clip-text text-transparent">
          Ferramentas de Poker
        </span>
        <button
          onClick={handleClearAll}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[#DEB887] hover:text-[#f5d0a9] transition-colors"
          title="Limpar seleção"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6 z-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Calculadora de <span className="text-[#98D8BA]">Equidade</span>
          </h1>
          <p className="text-white/60 text-xs mt-1">
            Simule probabilidades de vitória em tempo real usando Monte Carlo.
          </p>
        </div>

        {/* Input Slots */}
        <div className="bg-black/30 border border-[#DEB887]/15 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
          {/* Players Hands Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 Slot */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#98D8BA]">Você (Hero)</span>
              <div className="flex gap-2">
                {[0, 1].map(idx => {
                  const card = p1Cards[idx];
                  const isActive = activeSlot?.type === 'p1' && activeSlot.index === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlot({ type: 'p1', index: idx })}
                      className="cursor-pointer"
                    >
                      <Card
                        card={card || undefined}
                        hidden={!card}
                        size="md"
                        highlight={isActive}
                        className={!card ? "border-dashed border-white/30 bg-black/40" : ""}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player 2 Slot */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DEB887]">Oponente (Villain)</span>
              <div className="flex gap-2">
                {[0, 1].map(idx => {
                  const card = p2Cards[idx];
                  const isActive = activeSlot?.type === 'p2' && activeSlot.index === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlot({ type: 'p2', index: idx })}
                      className="cursor-pointer"
                    >
                      <Card
                        card={card || undefined}
                        hidden={!card}
                        size="md"
                        highlight={isActive}
                        className={!card ? "border-dashed border-white/30 bg-black/40" : ""}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Board Community Cards */}
          <div className="flex flex-col items-center gap-2 border-t border-white/5 pt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Mesa (Community Cards)</span>
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2, 3, 4].map(idx => {
                const card = boardCards[idx];
                const isActive = activeSlot?.type === 'board' && activeSlot.index === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlot({ type: 'board', index: idx })}
                    className="cursor-pointer"
                  >
                    <Card
                      card={card || undefined}
                      hidden={!card}
                      size="sm"
                      highlight={isActive}
                      className={!card ? "border-dashed border-white/30 bg-black/40" : ""}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-black/25 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/50">Equidade Dinâmica</span>
            {isCalculating ? (
              <span className="text-[9px] font-bold text-[#DEB887] animate-pulse">Calculando...</span>
            ) : result ? (
              <span className="text-[9px] font-mono text-[#98D8BA] uppercase">{result.simulations} Sims (RNG)</span>
            ) : (
              <span className="text-[9px] text-white/30 uppercase">Aguardando Cartas</span>
            )}
          </div>

          {result ? (
            <div className="flex flex-col gap-3">
              {/* P1 Win Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#98D8BA]">Você (Hero)</span>
                  <span className="font-mono text-[#98D8BA]">{result.p1Win.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-[#98D8BA] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.p1Win}%` }}
                  />
                </div>
              </div>

              {/* P2 Win Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#DEB887]">Oponente (Villain)</span>
                  <span className="font-mono text-[#DEB887]">{result.p2Win.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-[#DEB887] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.p2Win}%` }}
                  />
                </div>
              </div>

              {/* Tie Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-white/60">
                  <span>Empate (Split)</span>
                  <span className="font-mono">{result.tie.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-white/40 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.tie}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-white/30 text-xs">
              Complete as cartas de Você e Oponente para calcular.
            </div>
          )}
        </div>

        {/* Card Selection Grid */}
        <div className="bg-black/35 border border-[#DEB887]/15 rounded-3xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="text-center pb-1 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#DEB887]">Selecione uma Carta</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[170px] no-scrollbar">
            {SUITS.map(suit => {
              const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-200';
              return (
                <div key={suit} className="flex items-center gap-1.5">
                  {/* Suit symbol header */}
                  <span className={`w-6 text-center text-lg font-bold shrink-0 ${suitColor}`}>
                    {suitSymbols[suit]}
                  </span>
                  {/* Ranks list */}
                  <div className="flex-1 flex gap-1 justify-between">
                    {RANKS.map(rank => {
                      const isSelected = isCardSelected(rank, suit);
                      const isSuitRed = suit === 'hearts' || suit === 'diamonds';
                      return (
                        <button
                          key={rank}
                          onClick={() => handleSelectCard(rank, suit)}
                          disabled={isSelected}
                          className={`w-7 h-9 text-[10px] font-black rounded flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-black/60 border-white/5 text-white/20 cursor-not-allowed'
                              : 'bg-white hover:scale-105 active:scale-95 text-black border-slate-300'
                          }`}
                        >
                          <span className={isSelected ? 'text-white/25' : isSuitRed ? 'text-red-600' : 'text-black'}>
                            {rank}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Page SEO Accordion */}
        <div className="flex flex-col gap-3 mt-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-[#DEB887] px-1 mb-2">
            <HelpCircle size={16} />
            <span className="font-black uppercase tracking-wider text-xs">Perguntas Frequentes</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Question 1 */}
            <div className="bg-black/25 border border-white/5 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase text-white/95"
              >
                <span>Como a calculadora calcula as probabilidades?</span>
                <ChevronDown size={14} className={`transform transition-transform ${faqOpen[0] ? 'rotate-180 text-[#98D8BA]' : 'text-white/50'}`} />
              </button>
              {faqOpen[0] && (
                <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2">
                  Nossa ferramenta utiliza um algoritmo de simulação Monte Carlo. Ela pega as cartas selecionadas e executa 1.000 distribuições aleatórias das cartas restantes para o Flop, Turn e River. A partir do resultado dessas mãos resolvidas, calculamos a porcentagem exata de vitórias e empates.
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="bg-black/25 border border-white/5 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase text-white/95"
              >
                <span>O que é Equidade (Equity) no poker?</span>
                <ChevronDown size={14} className={`transform transition-transform ${faqOpen[1] ? 'rotate-180 text-[#98D8BA]' : 'text-white/50'}`} />
              </button>
              {faqOpen[1] && (
                <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2">
                  A equidade representa a sua parte esperada do pote no longo prazo, expressa como uma porcentagem. Por exemplo, se você tem 70% de equidade em um pote de $100, no longo prazo sua expectativa de retorno para essa jogada específica é de $70.
                </div>
              )}
            </div>

            {/* Question 3 */}
            <div className="bg-black/25 border border-white/5 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase text-white/95"
              >
                <span>Como posso usar isso no meu jogo real?</span>
                <ChevronDown size={14} className={`transform transition-transform ${faqOpen[2] ? 'rotate-180 text-[#98D8BA]' : 'text-white/50'}`} />
              </button>
              {faqOpen[2] && (
                <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2">
                  Você pode usar a calculadora para estudar cenários pós-jogo. Ao revisar as jogadas difíceis que você fez contra nossos bots ou em partidas reais, insira as mãos para entender se a sua decisão de pagar, aumentar ou desistir estava correta matematicamente com base no valor esperado (EV).
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
