import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Volume2, VolumeX, Share2, Info } from 'lucide-react';

interface CardInfo {
  r: string; // rank
  s: string; // suit symbol
  c: 'red' | 'black'; // color
}

interface PlayerReplay {
  id: number;
  name: string;
  role: string;
  x: number;
  y: number;
  initialStack: number;
  cards: [CardInfo, CardInfo];
  // Dynamic step values
  stack: number;
  bet: number;
  action: string;
  isFolded: boolean;
  isWinner: boolean;
}

interface ReplayHandData {
  title: string;
  pot: number;
  winnerName: string;
  winnerDesc: string;
  communityCards: CardInfo[];
  players: {
    id: number;
    name: string;
    role: string;
    initialStack: number;
    cards: [CardInfo, CardInfo];
  }[];
  steps: {
    phase: string;
    pot: number;
    boardCount: number; // 0, 3, 4, or 5 cards visible
    playerStates: {
      id: number;
      stack: number;
      bet: number;
      action: string;
      isFolded: boolean;
      isWinner: boolean;
      showCards: boolean;
    }[];
    description: string;
    chipSourceId?: number; // animate chips from player to pot
  }[];
}

const REPLAY_HANDS: Record<string, ReplayHandData> = {
  hand_1: {
    title: "Split Pot Histórico com Dois Pares de Rainhas",
    pot: 1400,
    winnerName: "DIVIDIDO: VOCÊ E BOT GABRIEL",
    winnerDesc: "Dois Pares de Rainhas e Seis com Ás Kicker",
    communityCards: [
      { r: 'Q', s: '♣', c: 'black' },
      { r: 'Q', s: '♠', c: 'black' },
      { r: '2', s: '♣', c: 'black' },
      { r: '6', s: '♥', c: 'red' },
      { r: '6', s: '♠', c: 'black' }
    ],
    players: [
      { id: 0, name: 'Você', role: 'BTN', initialStack: 1000, cards: [{ r: 'A', s: '♥', c: 'red' }, { r: 'J', s: '♣', c: 'black' }] },
      { id: 1, name: 'Bot Rafael', role: 'SB', initialStack: 850, cards: [{ r: '10', s: '♦', c: 'red' }, { r: '9', s: '♦', c: 'red' }] },
      { id: 2, name: 'Bot Sophia', role: 'BB', initialStack: 1200, cards: [{ r: 'Q', s: '♦', c: 'red' }, { r: 'K', s: '♠', c: 'black' }] },
      { id: 3, name: 'Bot Lucas', role: 'UTG', initialStack: 950, cards: [{ r: '2', s: '♠', c: 'black' }, { r: '7', s: '♥', c: 'red' }] },
      { id: 4, name: 'Bot Isabella', role: 'HJ', initialStack: 1100, cards: [{ r: '6', s: '♣', c: 'black' }, { r: '5', s: '♣', c: 'black' }] },
      { id: 5, name: 'Bot Gabriel', role: 'CO', initialStack: 700, cards: [{ r: 'A', s: '♠', c: 'black' }, { r: 'J', s: '♦', c: 'red' }] }
    ],
    steps: [
      {
        phase: "Pre-flop",
        pot: 30,
        boardCount: 0,
        description: "Pré-flop: Blinds postados. Bot Rafael posta SB de $10. Bot Sophia posta BB de $20.",
        playerStates: [
          { id: 0, stack: 1000, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 840, bet: 10, action: 'SB $10', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1180, bet: 20, action: 'BB $20', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 700, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Pre-flop Betting",
        pot: 110,
        boardCount: 0,
        description: "Bot Lucas desiste (Fold). Bot Isabella desiste. Bot Gabriel paga (Call) $20. Você paga $20. Bot Rafael paga $10. Bot Sophia passa (Check).",
        playerStates: [
          { id: 0, stack: 980, bet: 20, action: 'CALL $20', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 830, bet: 20, action: 'CALL $10', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1180, bet: 20, action: 'CHECK', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 680, bet: 20, action: 'CALL $20', isFolded: false, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Flop",
        pot: 190,
        boardCount: 3,
        description: "O Flop é distribuído: Q♣ Q♠ 2♣. Pote atual é de $190. Rodada de apostas inicia no SB.",
        playerStates: [
          { id: 0, stack: 980, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 830, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1180, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 680, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Flop Betting",
        pot: 390,
        boardCount: 3,
        description: "Bot Rafael aposta $50. Bot Sophia paga $50. Bot Gabriel paga $50. Você paga $50.",
        playerStates: [
          { id: 0, stack: 930, bet: 50, action: 'CALL $50', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 780, bet: 50, action: 'BET $50', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 50, action: 'CALL $50', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 630, bet: 50, action: 'CALL $50', isFolded: false, isWinner: false, showCards: false }
        ],
        chipSourceId: 1
      },
      {
        phase: "Turn",
        pot: 590,
        boardCount: 4,
        description: "O Turn traz o 6♥. Quatro jogadores continuam no pote de $390. Bot Rafael passa (Check).",
        playerStates: [
          { id: 0, stack: 930, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 780, bet: 0, action: 'CHECK', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 630, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Turn Betting",
        pot: 990,
        boardCount: 4,
        description: "Bot Sophia aposta $100. Bot Gabriel aumenta (Raise) para $200. Você paga $200. Bot Rafael desiste (Fold). Bot Sophia desiste.",
        playerStates: [
          { id: 0, stack: 730, bet: 200, action: 'CALL $200', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 780, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 100, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 430, bet: 200, action: 'RAISE $200', isFolded: false, isWinner: false, showCards: false }
        ],
        chipSourceId: 5
      },
      {
        phase: "River",
        pot: 990,
        boardCount: 5,
        description: "O River é o 6♠. Restam apenas Você e Bot Gabriel no pote principal. Você decide passar.",
        playerStates: [
          { id: 0, stack: 730, bet: 0, action: 'CHECK', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 430, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "River Betting",
        pot: 1390,
        boardCount: 5,
        description: "Bot Gabriel aposta $200. Você paga $200. Fim das apostas, vamos para o Showdown!",
        playerStates: [
          { id: 0, stack: 530, bet: 200, action: 'CALL $200', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 230, bet: 200, action: 'BET $200', isFolded: false, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Showdown",
        pot: 1400,
        boardCount: 5,
        description: "Showdown: As cartas são reveladas. Ambos têm A-J. Pelo board Q-Q-2-6-6, a melhor mão de 5 cartas para ambos é Q-Q-6-6-A (Dois Pares, Ás Kicker). O Pote é Dividido!",
        playerStates: [
          { id: 0, stack: 1230, bet: 0, action: 'SPLIT', isFolded: false, isWinner: true, showCards: true },
          { id: 1, stack: 780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1130, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 950, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 1100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 930, bet: 0, action: 'SPLIT', isFolded: false, isWinner: true, showCards: true }
        ]
      }
    ]
  },
  hand_2: {
    title: "Royal Flush Épico contra Full House de Ases",
    pot: 5200,
    winnerName: "VOCÊ VENCEU O POTE!",
    winnerDesc: "Royal Flush de Espadas (Mão Invencível!)",
    communityCards: [
      { r: 'A', s: '♠', c: 'black' },
      { r: 'K', s: '♠', c: 'black' },
      { r: 'Q', s: '♠', c: 'black' },
      { r: '10', s: '♥', c: 'red' },
      { r: '10', s: '♣', c: 'black' }
    ],
    players: [
      { id: 0, name: 'Você', role: 'BTN', initialStack: 3000, cards: [{ r: 'J', s: '♠', c: 'black' }, { r: '10', s: '♠', c: 'black' }] },
      { id: 1, name: 'Bot Rafael', role: 'SB', initialStack: 1500, cards: [{ r: '7', s: '♣', c: 'black' }, { r: '2', s: '♥', c: 'red' }] },
      { id: 2, name: 'Bot Sophia', role: 'BB', initialStack: 1800, cards: [{ r: '9', s: '♦', c: 'red' }, { r: '8', s: '♦', c: 'red' }] },
      { id: 3, name: 'Bot Lucas', role: 'UTG', initialStack: 2100, cards: [{ r: '5', s: '♥', c: 'red' }, { r: '4', s: '♦', c: 'red' }] },
      { id: 4, name: 'Bot Isabella', role: 'HJ', initialStack: 2800, cards: [{ r: 'A', s: '♥', c: 'red' }, { r: '10', s: '♦', c: 'red' }] },
      { id: 5, name: 'Bot Gabriel', role: 'CO', initialStack: 2200, cards: [{ r: 'K', s: '♣', c: 'black' }, { r: 'J', s: '♥', c: 'red' }] }
    ],
    steps: [
      {
        phase: "Pre-flop",
        pot: 30,
        boardCount: 0,
        description: "Pré-flop: Você recebe J♠ 10♠ de Espadas no botão (BTN). Ação começa nas posições iniciais.",
        playerStates: [
          { id: 0, stack: 3000, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 10, action: 'SB $10', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 20, action: 'BB $20', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 4, stack: 2800, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Pre-flop Betting",
        pot: 190,
        boardCount: 0,
        description: "Bot Lucas desiste. Bot Isabella aumenta (Raise) para $60. Bot Gabriel desiste. Você paga (Call) $60. Blinds desistem.",
        playerStates: [
          { id: 0, stack: 2940, bet: 60, action: 'CALL $60', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2740, bet: 60, action: 'RAISE $60', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Flop",
        pot: 150,
        boardCount: 3,
        description: "O Flop é dos sonhos: A♠ K♠ Q♠. Você flopou um Flush Draw real e um Straight Draw de duas pontas! Isabella lidera apostando.",
        playerStates: [
          { id: 0, stack: 2940, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2740, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Flop Betting",
        pot: 350,
        boardCount: 3,
        description: "Bot Isabella aposta $100. Você paga com seu draw monstruoso.",
        playerStates: [
          { id: 0, stack: 2840, bet: 100, action: 'CALL $100', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2640, bet: 100, action: 'BET $100', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Turn",
        pot: 350,
        boardCount: 4,
        description: "O Turn é o 10♥. Você agora tem um par de Dez e os mesmos draws. Isabella continua atirando.",
        playerStates: [
          { id: 0, stack: 2840, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2640, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Turn Betting",
        pot: 850,
        boardCount: 4,
        description: "Bot Isabella aposta $250. Você decide pagar novamente para ver a carta final.",
        playerStates: [
          { id: 0, stack: 2590, bet: 250, action: 'CALL $250', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2390, bet: 250, action: 'BET $250', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "River",
        pot: 850,
        boardCount: 5,
        description: "HISTÓRICO! O River é o 10♣. Você completa o ROYAL FLUSH (10, J, Q, K, A de Espadas)! Isabella, que completou um Full House, vai de All-in!",
        playerStates: [
          { id: 0, stack: 2590, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2390, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "River Betting",
        pot: 5200,
        boardCount: 5,
        description: "Bot Isabella vai All-in de $2,190! Você paga instantaneamente. Fim do suspense!",
        playerStates: [
          { id: 0, stack: 400, bet: 2190, action: 'CALL ALL-IN', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 200, bet: 2190, action: 'ALL-IN $2190', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Showdown",
        pot: 5200,
        boardCount: 5,
        description: "Vitória Épica! Bot Isabella mostra A♥ 10♦ para Full House (Ás com Dez). Você revela J♠ 10♠ para o invencível ROYAL FLUSH de Espadas! Você ganha o pote de $5,200!",
        playerStates: [
          { id: 0, stack: 5600, bet: 0, action: 'VENCEU!', isFolded: false, isWinner: true, showCards: true },
          { id: 1, stack: 1490, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 2, stack: 1780, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 200, bet: 0, action: 'LOSE', isFolded: false, isWinner: false, showCards: true },
          { id: 5, stack: 2200, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      }
    ]
  },
  hand_3: {
    title: "Quadra de Ás Supera Full House de Reis",
    pot: 8400,
    winnerName: "BOT RAFAEL VENCEU O POTE!",
    winnerDesc: "Quadra de Ás (Four of a Kind!)",
    communityCards: [
      { r: 'A', s: '♦', c: 'red' },
      { r: 'A', s: '♠', c: 'black' },
      { r: 'K', s: '♣', c: 'black' },
      { r: 'K', s: '♥', c: 'red' },
      { r: '2', s: '♠', c: 'black' }
    ],
    players: [
      { id: 0, name: 'Você', role: 'BTN', initialStack: 4500, cards: [{ r: 'K', s: '♠', c: 'black' }, { r: 'Q', s: '♦', c: 'red' }] },
      { id: 1, name: 'Bot Rafael', role: 'SB', initialStack: 4200, cards: [{ r: 'A', s: '♥', c: 'red' }, { r: 'A', s: '♣', c: 'black' }] },
      { id: 2, name: 'Bot Sophia', role: 'BB', initialStack: 1500, cards: [{ r: '10', s: '♦', c: 'red' }, { r: '3', s: '♦', c: 'red' }] },
      { id: 3, name: 'Bot Lucas', role: 'UTG', initialStack: 2000, cards: [{ r: 'J', s: '♣', c: 'black' }, { r: '9', s: '♠', c: 'black' }] },
      { id: 4, name: 'Bot Isabella', role: 'HJ', initialStack: 2500, cards: [{ r: '8', s: '♥', c: 'red' }, { r: '7', s: '♣', c: 'black' }] },
      { id: 5, name: 'Bot Gabriel', role: 'CO', initialStack: 2100, cards: [{ r: '5', s: '♦', c: 'red' }, { r: '4', s: '♠', c: 'black' }] }
    ],
    steps: [
      {
        phase: "Pre-flop",
        pot: 30,
        boardCount: 0,
        description: "Pré-flop: Você segura K♠ Q♦ no botão (BTN). Ação corre até você.",
        playerStates: [
          { id: 0, stack: 4500, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 4190, bet: 10, action: 'SB $10', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 20, action: 'BB $20', isFolded: false, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Pre-flop Betting",
        pot: 240,
        boardCount: 0,
        description: "Lucas, Isabella e Gabriel desistem. Você aumenta (Raise) para $60. Bot Rafael (SB) re-aumenta (3-Bet) para $180. Sophia desiste. Você paga.",
        playerStates: [
          { id: 0, stack: 4320, bet: 180, action: 'CALL $180', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 4020, bet: 180, action: '3-BET $180', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: 'FOLD', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Flop",
        pot: 380,
        boardCount: 3,
        description: "O Flop é A♦ A♠ K♣. Rafael tem um par de Ases e Você tem um par de Reis. Ambos jogam devagar. Rafael passa.",
        playerStates: [
          { id: 0, stack: 4320, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 4020, bet: 0, action: 'CHECK', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Flop Betting",
        pot: 680,
        boardCount: 3,
        description: "Você decide apostar $150 para testar a força do oponente. Rafael apenas paga.",
        playerStates: [
          { id: 0, stack: 4170, bet: 150, action: 'BET $150', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 3870, bet: 150, action: 'CALL $150', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 1
      },
      {
        phase: "Turn",
        pot: 680,
        boardCount: 4,
        description: "O Turn é o K♥! Você agora tem um Full House de Reis com Ases! Mas Rafael tem uma Quadra de Ás (Inacreditável!). Rafael passa novamente.",
        playerStates: [
          { id: 0, stack: 4170, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 3870, bet: 0, action: 'CHECK', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "Turn Betting",
        pot: 1480,
        boardCount: 4,
        description: "Com seu Full House, você aposta $400. Rafael faz um raise surpresa para $1,000! Você apenas paga para ver o River.",
        playerStates: [
          { id: 0, stack: 3570, bet: 1000, action: 'CALL $1000', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 2870, bet: 1000, action: 'RAISE $1000', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "River",
        pot: 2680,
        boardCount: 5,
        description: "O River é o inofensivo 2♠. O pote é de $2,680. O showdown é iminente. Rafael aposta forte.",
        playerStates: [
          { id: 0, stack: 3570, bet: 0, action: '', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 2870, bet: 0, action: '', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      },
      {
        phase: "River Betting",
        pot: 8400,
        boardCount: 5,
        description: "Rafael aposta $2,860 (All-in). Você paga com seu Full House, caindo no setup do baralho.",
        playerStates: [
          { id: 0, stack: 710, bet: 2860, action: 'CALL ALL-IN', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 10, bet: 2860, action: 'ALL-IN $2860', isFolded: false, isWinner: false, showCards: false },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ],
        chipSourceId: 0
      },
      {
        phase: "Showdown",
        pot: 8400,
        boardCount: 5,
        description: "Showdown doloroso! Você revela Reis cheios de Ases (Full House), mas Bot Rafael mostra A♥ A♣ para Quadra de Ás! Rafael leva o pote gigante de $8,400.",
        playerStates: [
          { id: 0, stack: 710, bet: 0, action: 'LOSE', isFolded: false, isWinner: false, showCards: true },
          { id: 1, stack: 8410, bet: 0, action: 'GANHOU!', isFolded: false, isWinner: true, showCards: true },
          { id: 2, stack: 1480, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 3, stack: 2000, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 4, stack: 2500, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false },
          { id: 5, stack: 2100, bet: 0, action: '', isFolded: true, isWinner: false, showCards: false }
        ]
      }
    ]
  }
};

export default function ReplayPage() {
  const { handId } = useParams<{ handId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load hand or fallback to hand_1
  const activeHandId = handId && REPLAY_HANDS[handId] ? handId : 'hand_1';
  const handData = REPLAY_HANDS[activeHandId];

  // Replay state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Auto playback effect
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = playbackSpeed === 2 ? 1500 : 3000;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < handData.steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, handData]);

  // Main Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;
    let chipAnimationT = 0;

    const render = () => {
      const stepData = handData.steps[currentStep];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw felt background (gradient)
      const bgGrad = ctx.createRadialGradient(200, 250, 50, 200, 250, 250);
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Table Felt Oval
      ctx.strokeStyle = 'rgba(222, 184, 135, 0.2)'; // Gold borders
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(200, 250, 160, 210, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(222, 184, 135, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(200, 250, 140, 190, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw Pot Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.strokeStyle = '#DEB887';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(140, 155, 120, 28, 14);
      ctx.fill();
      ctx.stroke();

      // Pot Gold Chip Icon
      ctx.fillStyle = '#DEB887';
      ctx.beginPath();
      ctx.arc(154, 169, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#022c22';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', 154, 172);

      // Pot Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`POTE: $${Math.floor(stepData.pot)}`, 168, 173);

      // 4. Draw Community Cards (Center board)
      const startCardX = 120;
      const cardY = 210;
      const cardW = 26;
      const cardH = 38;
      const cardGap = 6;

      for (let i = 0; i < 5; i++) {
        const cX = startCardX + i * (cardW + cardGap);
        const isVisible = i < stepData.boardCount;

        if (isVisible) {
          const card = handData.communityCards[i];
          // Card Face up
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cX, cardY, cardW, cardH, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Symbol suit
          ctx.fillStyle = card.c === 'red' ? '#dc2626' : '#0f172a';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(card.r, cX + 8, cardY + 12);
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(card.s, cX + cardW / 2, cardY + 28);
        } else {
          // Placeholder
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
      const PLAYER_COORDS: Record<number, { x: number; y: number }> = {
        0: { x: 200, y: 420 }, // BTN
        1: { x: 60, y: 325 },  // SB
        2: { x: 60, y: 175 },  // BB
        3: { x: 200, y: 80 },  // UTG
        4: { x: 340, y: 175 }, // HJ
        5: { x: 340, y: 325 }  // CO
      };

      handData.players.forEach(p => {
        const pState = stepData.playerStates.find(ps => ps.id === p.id);
        if (!pState) return;

        const coords = PLAYER_COORDS[p.id] || { x: 200, y: 250 };

        // Draw active turn / winner ring
        if (pState.isWinner) {
          ctx.strokeStyle = '#DEB887';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 25, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pState.action && pState.action !== 'FOLD') {
          ctx.strokeStyle = '#98D8BA';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 24, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Seat background
        ctx.fillStyle = pState.isWinner ? 'rgba(222, 184, 135, 0.2)' : (pState.isFolded ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.7)');
        ctx.strokeStyle = pState.isWinner ? '#DEB887' : (pState.isFolded ? 'rgba(255,255,255,0.05)' : 'rgba(222, 184, 135, 0.2)');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Initial letter
        ctx.fillStyle = pState.isWinner ? '#DEB887' : (pState.isFolded ? 'rgba(255,255,255,0.2)' : '#ffffff');
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name.charAt(0).toUpperCase(), coords.x, coords.y + 4);

        // Player Name & Stack Info (Badge below avatar)
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeStyle = pState.isWinner ? '#DEB887' : 'rgba(222, 184, 135, 0.15)';
        ctx.beginPath();
        ctx.roundRect(coords.x - 32, coords.y + 13, 64, 22, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pState.isFolded ? 'rgba(255,255,255,0.3)' : '#f8fafc';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(p.name, coords.x, coords.y + 21);
        ctx.fillStyle = pState.isFolded ? 'rgba(152,216,186,0.3)' : '#98D8BA';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(`$${Math.floor(pState.stack)}`, coords.x, coords.y + 30);

        // Role (D/BTN, SB, BB)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(coords.x + 16, coords.y - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#064e3b';
        ctx.font = 'bold 6px Inter, sans-serif';
        ctx.fillText(p.role, coords.x + 16, coords.y - 8);

        // Action speech bubble
        if (pState.action) {
          ctx.fillStyle = pState.action === 'FOLD' ? 'rgba(225, 90, 90, 0.9)' : '#ffffff';
          ctx.beginPath();
          ctx.roundRect(coords.x - 28, coords.y - 42, 56, 14, 4);
          ctx.fill();

          ctx.fillStyle = pState.action === 'FOLD' ? '#ffffff' : '#0f172a';
          ctx.font = 'bold 7px Inter, sans-serif';
          ctx.fillText(pState.action, coords.x, coords.y - 33);
        }

        // Draw Player Cards
        if (!pState.isFolded) {
          for (let cIdx = 0; cIdx < 2; cIdx++) {
            const cardX = coords.x - 14 + cIdx * 18;
            const cardY = coords.y - 30;
            const showFaceUp = pState.showCards;

            if (showFaceUp) {
              const card = p.cards[cIdx];
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(cardX - 8, cardY - 12, 16, 24, 3);
              ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.15)';
              ctx.stroke();

              ctx.fillStyle = card.c === 'red' ? '#dc2626' : '#0f172a';
              ctx.font = 'bold 7px Inter, sans-serif';
              ctx.fillText(card.r, cardX - 3, cardY - 2);
              ctx.font = '8px Inter, sans-serif';
              ctx.fillText(card.s, cardX, cardY + 7);
            } else {
              // Facedown Card Back
              ctx.fillStyle = '#1e40af'; // Blue back
              ctx.beginPath();
              ctx.roundRect(cardX - 8, cardY - 12, 16, 24, 3);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      // 6. Draw Betting Chips Animation (if source is defined)
      if (stepData.chipSourceId !== undefined) {
        const sourcePlayer = handData.players.find(p => p.id === stepData.chipSourceId);
        if (sourcePlayer) {
          const sourceCoords = PLAYER_COORDS[sourcePlayer.id] || { x: 200, y: 250 };
          chipAnimationT = (chipAnimationT + 0.05) % 1;
          const currentChipX = sourceCoords.x + (200 - sourceCoords.x) * chipAnimationT;
          const currentChipY = sourceCoords.y + (250 - sourceCoords.y) * chipAnimationT;

          ctx.fillStyle = '#DEB887';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(currentChipX, currentChipY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Showdown final banner
      if (stepData.phase === 'Showdown') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 220, canvas.width, 50);

        ctx.fillStyle = '#DEB887';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(handData.winnerName, 200, 238);
        
        ctx.fillStyle = '#98D8BA';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(handData.winnerDesc, 200, 256);
      }

      frame++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [currentStep, handData]);

  // Actions log text representation for search engines
  const logSteps = handData.steps.slice(0, currentStep + 1);

  return (
    <div className="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans overflow-x-hidden relative pb-10">
      {/* felt background overlay */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(circle_at_50%_0%,rgba(152,216,186,0.12),transparent_60%)] pointer-events-none z-0" />

      {/* Spectator Header */}
      <header className="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black uppercase tracking-wider text-[10px] text-[#DEB887]">Replay de Mão</span>
          <span className="text-xs text-white/40 font-mono">ID: {activeHandId.toUpperCase()}</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link do replay copiado!");
          }}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[#98D8BA] hover:text-[#86c7a9] transition-colors"
          title="Compartilhar jogada"
        >
          <Share2 size={16} />
        </button>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 flex flex-col gap-5 z-10">
        
        {/* Hand Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/5">
          {Object.keys(REPLAY_HANDS).map(hid => (
            <button
              key={hid}
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
                navigate(`/replay/${hid}`);
              }}
              className={`py-2 px-1 text-[9px] font-black uppercase rounded-xl transition-all ${
                activeHandId === hid
                  ? 'bg-[#98D8BA] text-[#121513] shadow-md'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {hid.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Hand Title */}
        <div className="text-center">
          <h1 className="text-lg font-black uppercase tracking-tight text-white line-clamp-2">
            {handData.title}
          </h1>
        </div>

        {/* Canvas Player Table */}
        <div className="flex items-center justify-center bg-black/10 rounded-[32px] p-2 border border-white/5 shadow-inner relative overflow-hidden group">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#DEB887]/20 rounded-tl-[32px]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#DEB887]/20 rounded-br-[32px]" />
          
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="w-full max-w-[340px] aspect-[4/5] object-contain block rounded-2xl"
          />
        </div>

        {/* Playback Controls Panel */}
        <div className="bg-black/35 border border-[#DEB887]/15 rounded-3xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">
              Controle de Reprodução
            </span>
            <span className="text-[10px] font-mono text-[#98D8BA]">
              Passo {currentStep + 1} de {handData.steps.length}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2 border-y border-white/5">
            {/* Step Back */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(prev => Math.max(0, prev - 1));
              }}
              disabled={currentStep === 0}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-[#98D8BA] text-[#121513] flex items-center justify-center hover:bg-[#86c7a9] active:scale-95 transition-all shadow-md"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Restart */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw size={16} />
            </button>

            {/* Step Forward */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(prev => Math.min(handData.steps.length - 1, prev + 1));
              }}
              disabled={currentStep === handData.steps.length - 1}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Speed & Sound */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-full border border-white/5">
              <button
                onClick={() => setPlaybackSpeed(1)}
                className={`px-3 py-1 text-[9px] font-black rounded-full transition-all ${
                  playbackSpeed === 1 ? 'bg-[#98D8BA] text-[#121513]' : 'text-white/60'
                }`}
              >
                1X SPEED
              </button>
              <button
                onClick={() => setPlaybackSpeed(2)}
                className={`px-3 py-1 text-[9px] font-black rounded-full transition-all ${
                  playbackSpeed === 2 ? 'bg-[#98D8BA] text-[#121513]' : 'text-white/60'
                }`}
              >
                2X SPEED
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-[#DEB887]/15 border-[#DEB887]/30 text-[#DEB887]'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Written Play-by-Play History - Primary Search Engine Text Core */}
        <div className="bg-black/25 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white/50 border-b border-white/5 pb-2">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Histórico da Jogada</span>
          </div>

          {/* This container lists the logs of actions, indexable by Googlebot directly! */}
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
            {handData.steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(idx);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#98D8BA]/10 border-[#98D8BA]/30 text-white font-bold'
                      : isPast
                      ? 'bg-black/20 border-white/5 text-white/50'
                      : 'bg-transparent border-transparent text-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[9px] uppercase tracking-widest">
                    <span>Passo {idx + 1} - {step.phase}</span>
                    {isActive && <span className="text-[#98D8BA] font-bold">Lendo</span>}
                  </div>
                  <p className="text-xs leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
