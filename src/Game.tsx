/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp, increment, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { Header } from './components/Header';
import { PokerTable } from './components/PokerTable';
import { Footer } from './components/Footer';
import { GameState, Player, CardData, Phase, Position } from './types';
import { createDeck, cardToString, stringToCard, formatCardForLog, getHandRank } from './lib/pokerUtils';
// @ts-ignore
import { Hand } from 'pokersolver';
import { cn } from './lib/utils';
import { sounds } from './lib/soundManager';
import { getBotSpeech, getRandomIdleSpeech, SpeechScenario } from './lib/botSpeech';

import { ActionControls } from './components/ActionControls';
import { ResultsOverlay } from './components/ResultsOverlay';
import { FoldOverlay } from './components/FoldOverlay';
import { ActionLog } from './components/ActionLog';
import { HandsGuide } from './components/HandsGuide';
import { AnimatePresence, motion } from 'motion/react';

const POSITIONS: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
const SMALL_BLIND = 10;
const BIG_BLIND = 20;

const INITIAL_PLAYERS: Player[] = [
  { id: 'human', name: 'Você', position: 'BTN', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: true, isHuman: true, hasActed: false },
  { id: 'bot1', name: 'Bot Daniel', position: 'SB', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: false, isHuman: false, hasActed: false, avatar: '/avatars/bot1.jpg' },
  { id: 'bot2', name: 'Bot Bob', position: 'BB', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: false, isHuman: false, hasActed: false, avatar: '/avatars/bot2.jpg' },
  { id: 'bot3', name: 'Bot Carol', position: 'UTG', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: false, isHuman: false, hasActed: false, avatar: '/avatars/bot3.jpg' },
  { id: 'bot4', name: 'Bot Ana', position: 'HJ', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: false, isHuman: false, hasActed: false, avatar: '/avatars/bot4.jpg' },
  { id: 'bot5', name: 'Bot Thalita', position: 'CO', stack: 1000, initialStack: 1000, bet: 0, isActive: true, isFolded: false, isDealer: false, isHuman: false, hasActed: false, avatar: '/avatars/bot5.jpg' },
];

export default function Game() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!user || sessionStarted) return;
    setSessionStarted(true);
  }, [user, sessionStarted]);

  useEffect(() => {
    if (user) {
      setGameState(prev => {
        const newPlayers = prev.players.map(p => {
          if (p.isHuman) {
            return {
              ...p,
              avatar: user.photoURL || undefined,
              name: user.displayName || p.name
            };
          }
          return p;
        });
        const human = prev.players.find(p => p.isHuman);
        if (human && (human.name !== (user.displayName || human.name) || human.avatar !== (user.photoURL || undefined))) {
          return { ...prev, players: newPlayers };
        }
        return prev;
      });
    }
  }, [user]);

  const location = useLocation();
  const [loadingState, setLoadingState] = useState(location.state?.resume ? true : false);
  const [gameState, setGameState] = useState<GameState>({
    pot: 0,
    phase: 'Waiting',
    communityCards: [],
    players: INITIAL_PLAYERS,
    dealerIndex: 0,
    currentTurnIndex: -1,
    currentBet: 0,
    minRaise: BIG_BLIND,
    deck: [],
    actionLog: [],
    fastForward: false,
  });

  useEffect(() => {
    if (location.state?.resume && user) {
      const fetchState = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid, 'currentGame', 'active'));
          if (docSnap.exists()) {
            const parsed = JSON.parse(docSnap.data().stateData) as GameState;
            if (parsed.players) {
              parsed.players = parsed.players.map(p => {
                if (!p.isHuman && !p.avatar) {
                  return { ...p, avatar: `/avatars/${p.id}.jpg` };
                }
                if (p.isHuman) {
                  return {
                    ...p,
                    avatar: user.photoURL || undefined,
                    name: user.displayName || p.name
                  };
                }
                return p;
              });
            }
            setGameState(parsed);
          }
        } catch (e) {
          console.error("Erro ao carregar partida", e);
        } finally {
          setLoadingState(false);
        }
      };
      fetchState();
    }
  }, [user, location.state]);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (loadingState || !user) return;

    // Debounce saves
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid, 'currentGame', 'active'), {
          stateData: JSON.stringify(gameState),
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Falha ao salvar partida", e);
      }
    }, 1000);

    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [gameState, user, loadingState]);

  const handleLeave = async (saveSession: boolean = false) => {
    if (!user) {
      navigate('/');
      return;
    }
    const humanPlayer = gameState.players.find(p => p.isHuman);
    const stack = humanPlayer ? Math.floor(humanPlayer.stack) : 1000;
    const diff = stack - 1000;
    try {
      if (!saveSession) {
        if (sessionStarted && diff !== 0) {
          await setDoc(doc(db, 'users', user.uid), {
            credits: increment(diff)
          }, { merge: true });
          await addDoc(collection(db, 'users', user.uid, 'matches'), {
            status: diff > 0 ? 'won' : 'lost',
            winnings: diff,
            createdAt: serverTimestamp()
          });
        }
        await deleteDoc(doc(db, 'users', user.uid, 'currentGame', 'active')).catch(() => { });
      } else {
        await setDoc(doc(db, 'users', user.uid, 'currentGame', 'active'), {
          stateData: JSON.stringify(gameState),
          updatedAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      navigate('/');
    }
  };

  const handleHeaderBack = () => {
    if (gameState.phase === 'Waiting' || gameState.phase === 'Showdown') {
      // Hands not running or just finished, safe to just leave & finalize without modal
      handleLeave(false);
    } else {
      setShowLeaveConfirm(true);
    }
  };


  const [message, setMessage] = useState<{ text: string, id: string } | null>({ text: "Bem-vindo ao Poker! Clique em Iniciar.", id: Date.now().toString() });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const botThinkTimeout = useRef<NodeJS.Timeout | null>(null);
  const humanThinkInterval = useRef<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const startNewHand = useCallback(() => {
    sounds.init();
    sounds.playDealingCards();

    const deck = createDeck();

    // 1. Rebuy human if out of chips
    const playersTemp = gameState.players.map(p => {
      if (p.isHuman && p.stack <= 0) {
        return { ...p, stack: 1000 };
      }
      return p;
    });

    // 2. Count active players
    const activeCount = playersTemp.filter(p => p.stack > 0).length;
    // If less than 3 active players, rebuy all bots with 0 stack to 1000 to keep table active
    const finalPlayersBeforeHand = playersTemp.map(p => {
      if (activeCount < 3 && p.stack <= 0) {
        return { ...p, stack: 1000 };
      }
      return p;
    });

    // Helper to find the next active player index (stack > 0)
    const getNextActiveIndex = (startIndex: number) => {
      let idx = startIndex;
      for (let i = 0; i < 6; i++) {
        if (finalPlayersBeforeHand[idx].stack > 0) {
          return idx;
        }
        idx = (idx + 1) % 6;
      }
      return startIndex;
    };

    const newDealerIndex = getNextActiveIndex((gameState.dealerIndex + 1) % 6);
    const sbIndex = getNextActiveIndex((newDealerIndex + 1) % 6);
    const bbIndex = getNextActiveIndex((sbIndex + 1) % 6);
    const firstToActIndex = getNextActiveIndex((bbIndex + 1) % 6);

    const newPlayers = finalPlayersBeforeHand.map((p, i) => {
      const posIndex = (i - newDealerIndex + 6) % 6;
      let bet = 0;
      let stack = p.stack;

      // Only post blinds if player is active
      if (stack > 0) {
        if (i === sbIndex) {
          bet = Math.min(SMALL_BLIND, stack);
          stack -= bet;
        } else if (i === bbIndex) {
          bet = Math.min(BIG_BLIND, stack);
          stack -= bet;
        }
      }

      const playerActive = stack > 0 || bet > 0;

      return {
        ...p,
        position: POSITIONS[posIndex],
        cards: playerActive ? [deck[i * 2], deck[i * 2 + 1]] : [],
        isActive: playerActive,
        isFolded: !playerActive,
        isDealer: i === newDealerIndex && playerActive,
        isWinner: false,
        bet,
        stack,
        initialStack: stack + bet,
        lastAction: undefined,
        winningHandDesc: undefined,
        handDesc: undefined,
        hasActed: false
      };
    });

    const actualPot = newPlayers.reduce((sum, p) => sum + p.bet, 0);

    setGameState({
      phase: 'Pre-flop',
      pot: actualPot,
      communityCards: [],
      players: newPlayers,
      dealerIndex: newDealerIndex,
      currentTurnIndex: firstToActIndex,
      currentBet: newPlayers[bbIndex].bet,
      minRaise: BIG_BLIND,
      deck: deck.slice(12),
      actionLog: [],
      fastForward: false,
    });
    setIsProcessing(false);
    setMessage({ text: "Nova mão iniciada!", id: `msg-${Date.now()}` });
  }, [gameState.dealerIndex, gameState.players]);

  const handleAction = useCallback((action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => {
    if (isProcessing) return;

    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentTurnIndex];
      const newPlayers = [...prev.players];
      let newPot = prev.pot;
      let newCurrentBet = prev.currentBet;
      let newMinRaise = prev.minRaise;
      let newCurrentTurnIndex = prev.currentTurnIndex;

      let actionLabel = "";
      let logActionDetail = "";

      if (action === 'fold') {
        actionLabel = "Fold";
        logActionDetail = "Fold";
        newPlayers[prev.currentTurnIndex] = { ...currentPlayer, isFolded: true, lastAction: "FOLD", hasActed: true, speech: !currentPlayer.isHuman ? { text: getBotSpeech(currentPlayer.name, 'fold'), expiresAt: Date.now() + 2500 } : undefined };
        if (currentPlayer.isHuman) sounds.playAction('fold');
      } else if (action === 'call') {
        const callAmount = newCurrentBet - currentPlayer.bet;
        const actualCall = Math.min(callAmount, currentPlayer.stack);
        actionLabel = actualCall === currentPlayer.stack ? "ALL IN" : (newCurrentBet === 0 ? "CHECK" : "CALL");
        logActionDetail = actualCall === currentPlayer.stack ? `ALL IN $${Math.floor(actualCall)}` : (newCurrentBet === 0 ? "CHECK" : `CALL $${Math.floor(actualCall)}`);

        let speechScenario: SpeechScenario | undefined = undefined;
        if (!currentPlayer.isHuman) {
          if (actualCall === currentPlayer.stack) speechScenario = 'all-in';
          else if (newCurrentBet > BIG_BLIND * 3) speechScenario = 'bluff-call';
        }

        newPlayers[prev.currentTurnIndex] = {
          ...currentPlayer,
          stack: currentPlayer.stack - actualCall,
          bet: currentPlayer.bet + actualCall,
          lastAction: actionLabel,
          hasActed: true,
          speech: speechScenario ? { text: getBotSpeech(currentPlayer.name, speechScenario), expiresAt: Date.now() + 2500 } : undefined
        };
        newPot += actualCall;
        if (actionLabel === 'CHECK') {
          if (currentPlayer.isHuman) sounds.playAction('check');
        } else if (actionLabel === 'ALL IN') {
          sounds.playAction('allin');
        } else {
          sounds.playAction('call');
        }
      } else if (action === 'raise' && amount) {
        let targetBet = amount;
        let added = targetBet - currentPlayer.bet;

        if (added > currentPlayer.stack) {
          added = currentPlayer.stack;
          targetBet = currentPlayer.bet + added;
        }

        actionLabel = added === currentPlayer.stack ? "ALL IN" : "RAISE";
        logActionDetail = added === currentPlayer.stack ? `ALL IN $${Math.floor(added)}` : `RAISE para $${Math.floor(targetBet)}`;

        let speechScenario: SpeechScenario | undefined = undefined;
        if (!currentPlayer.isHuman) {
          if (added === currentPlayer.stack) speechScenario = 'all-in';
          else speechScenario = prev.phase === 'Pre-flop' ? 'pre-flop-raise' : 'flop-raise';
        }

        newPlayers[prev.currentTurnIndex] = {
          ...currentPlayer,
          stack: currentPlayer.stack - added,
          bet: targetBet,
          lastAction: actionLabel,
          hasActed: true,
          speech: speechScenario ? { text: getBotSpeech(currentPlayer.name, speechScenario), expiresAt: Date.now() + 2500 } : undefined
        };
        newPot += added;

        if (targetBet > newCurrentBet) {
          newMinRaise = Math.max(BIG_BLIND, targetBet - newCurrentBet);
          newCurrentBet = targetBet;
        }
        if (actionLabel === 'ALL IN') {
          sounds.playAction('allin');
        } else {
          sounds.playAction('raise');
        }
      } else if (action === 'check') {
        actionLabel = "CHECK";
        logActionDetail = "CHECK";
        newPlayers[prev.currentTurnIndex] = { ...currentPlayer, lastAction: "CHECK", hasActed: true };
        if (currentPlayer.isHuman) sounds.playAction('check');
      }

      // Check if we should re-act to aggressive raises by picking another bot arbitrarily (idle chat effect)
      if (action === 'raise' && Math.random() > 0.4) {
        const otherBots = newPlayers.filter(p => !p.isHuman && !p.isFolded && p.id !== currentPlayer.id);
        if (otherBots.length > 0) {
          const spectator = otherBots[Math.floor(Math.random() * otherBots.length)];
          const idx = newPlayers.findIndex(p => p.id === spectator.id);
          newPlayers[idx] = { ...spectator, speech: { text: "Calma aí...", expiresAt: Date.now() + 2500 } };
        }
      }

      // Append to actionLog
      const newLogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, playerName: currentPlayer.name, action: logActionDetail };

      // Clear lastAction after delay
      const playerIndexToClear = prev.currentTurnIndex;
      setTimeout(() => {
        setGameState(g => {
          const players = [...g.players];
          if (players[playerIndexToClear]) {
            players[playerIndexToClear] = { ...players[playerIndexToClear], lastAction: undefined };
          }
          return { ...g, players };
        });
      }, prev.fastForward ? 0 : 2500);

      // Check if round is over
      const activePlayers = newPlayers.filter(p => !p.isFolded && p.stack > 0);
      const allMatched = newPlayers.every(p => p.isFolded || p.stack === 0 || (p.isActive && p.bet === newCurrentBet && p.hasActed));

      const nextTurn = (prev.currentTurnIndex + 1) % 6;

      // Basic check for round end
      if (activePlayers.length <= 1) {
        // Fold victory - direct to showdown
        return { ...prev, players: newPlayers, pot: newPot, currentTurnIndex: -1, phase: 'Showdown', actionLog: [newLogEntry, ...prev.actionLog] };
      }

      // Find next player who hasn't folded
      let nextValidIndex = nextTurn;
      while (newPlayers[nextValidIndex].isFolded || newPlayers[nextValidIndex].stack <= 0) {
        nextValidIndex = (nextValidIndex + 1) % 6;
        if (nextValidIndex === prev.currentTurnIndex) break; // Should not happen
      }

      // If everyone finished their action
      if (allMatched) {
        return {
          ...prev,
          players: newPlayers,
          pot: newPot,
          currentTurnIndex: -1,
          currentBet: newCurrentBet,
          minRaise: newMinRaise,
          actionLog: [newLogEntry, ...prev.actionLog]
        };
      }

      return {
        ...prev,
        players: newPlayers,
        pot: newPot,
        currentTurnIndex: -2,
        pendingNextTurnIndex: nextValidIndex,
        currentBet: newCurrentBet,
        minRaise: newMinRaise,
        actionLog: [newLogEntry, ...prev.actionLog]
      };
    });
  }, [isProcessing]);

  // Turn delay transition
  useEffect(() => {
    if (gameState.currentTurnIndex === -2 && gameState.phase !== 'Waiting' && gameState.phase !== 'Showdown') {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentTurnIndex: prev.pendingNextTurnIndex ?? 0,
          pendingNextTurnIndex: undefined
        }));
        setIsProcessing(false);
      }, gameState.fastForward ? 50 : 1500); // 1.5s delay to pass the turn
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurnIndex, gameState.phase, gameState.fastForward]);

  // Transitions
  useEffect(() => {
    if (gameState.currentTurnIndex === -1 && gameState.phase !== 'Waiting' && gameState.phase !== 'Showdown') {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setGameState(prev => {
          let nextPhase: Phase = prev.phase;
          let newCommunity = [...prev.communityCards];
          let newDeck = [...prev.deck];

          // Clear bets and hasActed
          const playersResetBets = prev.players.map(p => ({ ...p, bet: 0, hasActed: false }));

          if (prev.phase === 'Pre-flop') {
            sounds.playCommunityCardsDeal(3);
            nextPhase = 'Flop';
            newCommunity = [newDeck[0], newDeck[1], newDeck[2]];
            newDeck = newDeck.slice(3);
          } else if (prev.phase === 'Flop') {
            sounds.playCommunityCardsDeal(1);
            nextPhase = 'Turn';
            newCommunity = [...prev.communityCards, newDeck[0]];
            newDeck = newDeck.slice(1);
          } else if (prev.phase === 'Turn') {
            sounds.playCommunityCardsDeal(1);
            nextPhase = 'River';
            newCommunity = [...prev.communityCards, newDeck[0]];
            newDeck = newDeck.slice(1);
          } else if (prev.phase === 'River') {
            nextPhase = 'Showdown';
            return { ...prev, phase: 'Showdown' };
          }

          // Next to act is to the left of dealer
          const activeAfterReset = playersResetBets.filter(p => !p.isFolded && p.stack > 0);
          let nextToAct = -1;

          if (activeAfterReset.length > 1 && nextPhase !== 'Showdown') {
            nextToAct = (prev.dealerIndex + 1) % 6;
            while (playersResetBets[nextToAct].isFolded || playersResetBets[nextToAct].stack <= 0) {
              nextToAct = (nextToAct + 1) % 6;
            }
          }

          let logAction = `Distribuiu ${nextPhase}`;
          if (nextPhase === 'Flop') logAction += `: ${newCommunity.map(formatCardForLog).join(" ")}`;
          else if (nextPhase === 'Turn') logAction += `: ${formatCardForLog(newCommunity[3])}`;
          else if (nextPhase === 'River') logAction += `: ${formatCardForLog(newCommunity[4])}`;

          return {
            ...prev,
            phase: nextPhase,
            communityCards: newCommunity,
            players: playersResetBets,
            deck: newDeck,
            currentTurnIndex: nextToAct,
            currentBet: 0,
            minRaise: BIG_BLIND,
            actionLog: nextPhase !== 'Showdown' ? [{ id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, playerName: "Mesa", action: logAction }, ...prev.actionLog] : prev.actionLog
          };
        });
        setIsProcessing(false);
      }, gameState.fastForward ? 50 : 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurnIndex, gameState.phase, gameState.dealerIndex, gameState.fastForward]);

  // Showdown Logic
  useEffect(() => {
    if (gameState.phase === 'Showdown' && !gameState.players.some(p => p.isWinner)) {
      const activePlayers = gameState.players.filter(p => !p.isFolded);

      if (activePlayers.length <= 1) {
        // Only one left
        setGameState(prev => {
          if (prev.players.some(p => p.isWinner)) return prev;
          return {
            ...prev,
            players: prev.players.map(p => {
              const isWin = p.id === activePlayers[0]?.id;
              return {
                ...p,
                isWinner: isWin,
                stack: isWin ? p.stack + prev.pot : p.stack,
                speech: !p.isHuman ? { text: getBotSpeech(p.name, isWin ? 'win' : 'lose'), expiresAt: Date.now() + 5000 } : undefined
              };
            }),
            pot: 0,
            actionLog: [{
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              playerName: "Mesa",
              action: `${activePlayers[0]?.name || 'Jogador'} venceu $${prev.pot} por desistência`
            }, ...prev.actionLog]
          };
        });
        if (activePlayers[0]?.isHuman) sounds.playWin();
        setMessage({ text: `${activePlayers[0]?.name || 'Alguém'} venceu por desistência!`, id: `msg-${Date.now()}` });
      } else {
        const hands = activePlayers.map(p => {
          const cards = p.cards!.map(cardToString);
          const comm = gameState.communityCards.map(cardToString);
          const allCards = [...cards, ...comm];
          // Filter out potential invalid cards
          const validCards = allCards.filter(c => c && c.length >= 2);
          // @ts-ignore
          return { id: p.id, hand: Hand.solve(validCards) };
        });

        const solvedHands = hands.map(h => h.hand);
        const winners = Hand.winners(solvedHands);
        const winnerIds = hands.filter(h => winners.includes(h.hand)).map(h => h.id);

        setGameState(prev => {
          if (prev.players.some(p => p.isWinner)) return prev;
          const share = Math.floor(prev.pot / winnerIds.length);
          return {
            ...prev,
            players: prev.players.map(p => {
              const h = hands.find(handObj => handObj.id === p.id);
              const bestCardsStr = h?.hand.cards.map((c: any) => c.toString()) || [];
              const isWin = winnerIds.includes(p.id);
              return {
                ...p,
                isWinner: isWin,
                stack: Math.floor(isWin ? p.stack + share : p.stack),
                winningHandDesc: isWin ? h?.hand.descr : undefined,
                handDesc: h?.hand.descr,
                bestCards: bestCardsStr.map(stringToCard),
                speech: !p.isHuman ? { text: getBotSpeech(p.name, isWin ? 'win' : 'lose'), expiresAt: Date.now() + 5000 } : undefined
              };
            }),
            pot: 0,
            actionLog: [{
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              playerName: winnerIds.length > 1 ? 'Empate' : (prev.players.find(pl => pl.id === winnerIds[0])?.name || ''),
              action: `Venceu com ${hands.find(h => h.id === winnerIds[0])?.hand.descr || '...'}`
            }, ...prev.actionLog]
          };
        });

        if (winnerIds.includes(humanPlayer?.id || "")) {
          sounds.playWin();
        }
        setMessage({ text: `${winnerIds.length > 1 ? 'Empate!' : gameState.players.find(p => p.id === winnerIds[0])?.name + ' venceu!'}`, id: `msg-${Date.now()}` });
      }
    }
  }, [gameState.phase, gameState.players, gameState.communityCards, gameState.pot]);

  // Human Logic - Time Limit
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (gameState.phase !== 'Waiting' && gameState.phase !== 'Showdown' && currentPlayer?.isHuman && !isProcessing) {
      if (timeRemaining === null) setTimeRemaining(60);
      humanThinkInterval.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (humanThinkInterval.current) clearInterval(humanThinkInterval.current);
            handleAction('fold');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (humanThinkInterval.current) clearInterval(humanThinkInterval.current);
      setTimeRemaining(null);
    }
    return () => { if (humanThinkInterval.current) clearInterval(humanThinkInterval.current); };
  }, [gameState.currentTurnIndex, gameState.phase, isProcessing, handleAction]);

  // Bot Logic - Strategic
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (gameState.phase !== 'Waiting' && gameState.phase !== 'Showdown' && currentPlayer && !currentPlayer.isHuman && !isProcessing) {
      botThinkTimeout.current = setTimeout(() => {
        const needsToCall = gameState.currentBet - currentPlayer.bet;
        const totalPot = gameState.pot + needsToCall;
        const potOdds = totalPot > 0 ? needsToCall / totalPot : 0;

        const community = gameState.communityCards.map(cardToString);
        const holeCards = currentPlayer.cards!.map(cardToString);

        let handRank = 0;
        try {
          const solved = Hand.solve([...holeCards, ...community]);
          handRank = getHandRank(solved);
        } catch (e) {
          handRank = 0;
        }

        const rand = Math.random();

        // AI Strategy decision
        if (needsToCall > 0) {
          // Decision to stay or fold
          let shouldStay = false;

          if (handRank >= 3) {
            shouldStay = true; // 3 of a kind or better
          } else if (handRank === 2) {
            // Two pair: Stay mostly, but fold to giant bets if unlucky
            shouldStay = rand < 0.8 || needsToCall <= BIG_BLIND * 5;
          } else if (handRank === 1) {
            // Pair: Stay if odds are good and bet is small, or slightly lucky
            shouldStay = (potOdds < 0.3 && needsToCall <= BIG_BLIND * 3) || rand < 0.15;
          } else if (gameState.phase === 'Pre-flop') {
            // Pre-flop (high card): fold to raises most of the time
            shouldStay = rand < 0.2 || needsToCall <= BIG_BLIND;
          } else {
            // High card post-flop: almost always fold
            shouldStay = rand < 0.02;
          }

          if (!shouldStay) {
            handleAction('fold');
          } else {
            // Check for Raise
            const strongHand = handRank >= 4; // Straight or better
            const bluffing = rand < 0.02; // 2% bluff

            if ((strongHand || bluffing) && currentPlayer.stack > needsToCall + 40) {
              handleAction('raise', gameState.currentBet + (strongHand ? 80 : 40));
            } else {
              handleAction('call');
            }
          }
        } else {
          // No current bet: check or bet
          const aggressive = handRank >= 3 || (handRank === 2 && rand < 0.5) || (gameState.phase === 'Pre-flop' && rand < 0.05);
          const bluffing = rand < 0.03;

          if ((aggressive || bluffing) && currentPlayer.stack > 40) {
            handleAction('raise', gameState.currentBet > 0 ? gameState.currentBet + 40 : 40);
          } else {
            handleAction('check');
          }
        }
      }, gameState.fastForward ? 50 : Math.floor(Math.random() * 1500) + 1000); // 1s to 2.5s
    }
    return () => { if (botThinkTimeout.current) clearTimeout(botThinkTimeout.current); };
  }, [gameState.currentTurnIndex, gameState.currentBet, gameState.phase, handleAction, isProcessing, gameState.fastForward]);

  // Clear speeches periodically and handle idle chat
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let changed = false;
        const now = Date.now();
        const newPlayers = prev.players.map(p => {
          let newSpeech = p.speech;
          if (p.speech && p.speech.expiresAt <= now) {
            changed = true;
            newSpeech = undefined;
          }
          return { ...p, speech: newSpeech };
        });

        // Idle speech randomly: ~ 2% chance per check (roughly every 25 seconds given 500ms intervals) if waiting or pre-flop/flop, etc
        if (!changed && (prev.phase !== 'Showdown' && prev.phase !== 'Waiting') && Math.random() < 0.02) {
          const idles = newPlayers.filter(p => !p.isHuman && !p.isFolded && !p.speech);
          if (idles.length > 0) {
            const talker = idles[Math.floor(Math.random() * idles.length)];
            const talkerIdx = newPlayers.findIndex(p => p.id === talker.id);
            newPlayers[talkerIdx] = { ...talker, speech: { text: getRandomIdleSpeech(talker.name), expiresAt: now + 3000 } };
            changed = true;
          }
        }

        if (changed) return { ...prev, players: newPlayers };
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const humanPlayer = gameState.players.find(p => p.isHuman);
  const isHumanTurn = gameState.currentTurnIndex !== -1 && gameState.players[gameState.currentTurnIndex]?.isHuman;
  const needsToCall = gameState.currentBet - (humanPlayer?.bet || 0);

  // Big Blind "Option" check: Can check in pre-flop if bet is equal to Big Blind
  const canCheckPreflopBB = gameState.phase === 'Pre-flop' &&
    humanPlayer?.position === 'BB' &&
    gameState.currentBet === BIG_BLIND &&
    humanPlayer.bet === BIG_BLIND;

  const canCheck = needsToCall === 0 || canCheckPreflopBB;

  if (loadingState) {
    return <div className="min-h-screen bg-[#121513] flex items-center justify-center text-emerald-500 font-black animate-pulse text-sm uppercase tracking-tighter">Carregando Partida...</div>;
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#121513] text-white flex flex-col font-sans selection:bg-emerald-500/30 overflow-hidden relative transition-all duration-300",
      isGuideOpen ? "md:pr-80" : ""
    )}>
      <Header onLeave={handleHeaderBack} />
      <ActionLog logs={gameState.actionLog} isGuideOpen={isGuideOpen} />
      <HandsGuide isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} />

      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 px-6 py-2 text-center text-sm font-bold text-emerald-400 uppercase tracking-widest bg-[#121513]/90 backdrop-blur-sm border border-emerald-500/20 rounded-full shadow-2xl"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-center mt-2 px-2 sm:px-4 overflow-visible">
        <div className="w-full h-full max-h-[60vh] sm:max-h-none flex items-center justify-center aspect-square sm:aspect-auto">
          <PokerTable
            players={gameState.players}
            communityCards={gameState.communityCards}
            pot={gameState.pot}
            currentTurnIndex={gameState.currentTurnIndex}
          />
        </div>

        {/* Game Phase Indicator */}
        <div className="flex gap-2 mt-4">
          {["Pre-flop", "Flop", "Turn", "River"].map(p => (
            <div key={p} className={cn(
              "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all",
              gameState.phase === p ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/30"
            )}>
              {p}
            </div>
          ))}
        </div>


      </main>

      {/* Footer / Controls */}
      <footer className="p-6 pb-12 bg-gradient-to-t from-black to-transparent relative z-50">
        {gameState.phase === 'Waiting' ? (
          <div className="flex justify-center">
            <button
              onClick={startNewHand}
              className="w-full max-w-sm h-14 bg-[#98D8BA] text-[#121513] font-black uppercase text-sm rounded-full shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"
            >
              Iniciar Jogo
            </button>
          </div>
        ) : gameState.phase !== 'Showdown' && !humanPlayer?.isFolded ? (
          <div className="flex flex-col gap-4">
            {isHumanTurn && timeRemaining !== null && !isProcessing && (
              <div className="max-w-sm mx-auto w-full px-2 flex flex-col gap-1 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <div className="flex justify-between">
                  <span>Sua Vez</span>
                  <span className={timeRemaining <= 10 ? "text-rose-400" : "text-emerald-400"}>00:{timeRemaining.toString().padStart(2, '0')}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-[width] duration-1000 ease-linear rounded-full",
                      timeRemaining <= 10 ? "bg-rose-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${(timeRemaining / 60) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <ActionControls
              onAction={handleAction}
              canCheck={canCheck}
              callAmount={canCheck ? 0 : needsToCall}
              currentBet={gameState.currentBet}
              minRaise={gameState.currentBet + gameState.minRaise}
              maxRaise={humanPlayer!.stack + humanPlayer!.bet}
              pot={gameState.pot}
              disabled={!isHumanTurn || isProcessing}
            />
          </div>
        ) : null}
      </footer>

      <AnimatePresence>
        {gameState.phase === 'Showdown' && (
          <ResultsOverlay
            players={gameState.players}
            communityCards={gameState.communityCards}
            onNextHand={startNewHand}
            onLeave={handleHeaderBack}
          />
        )}
        {(humanPlayer?.isFolded && !gameState.fastForward && gameState.phase !== 'Waiting' && gameState.phase !== 'Showdown') && (
          <FoldOverlay
            onFastForward={() => setGameState(g => ({ ...g, fastForward: true }))}
            onLeave={handleHeaderBack}
          />
        )}
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-[320px] sm:max-w-sm bg-[#1A1D1A] border border-emerald-900/50 rounded-3xl p-5 sm:p-6 text-center shadow-2xl relative">
              <h2 className="text-lg sm:text-xl font-black text-rose-400 uppercase tracking-wider mb-2">Atenção ao Sair</h2>
              <p className="text-white/70 text-[11px] sm:text-xs mb-4 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                Se você <strong>Sair e Continuar Depois</strong>, a mesa será salva.
                <br /><br />
                Se você <strong>Abandonar Partida</strong>, a mesa será encerrada. <span className="text-rose-300">As fichas que você já apostou nesta rodada serão perdidas e você não levará nada deste pote.</span>
              </p>
              <div className="text-white/70 text-xs sm:text-sm mb-6 flex flex-col gap-1">
                <span>Stack Atual: <strong className="text-emerald-400">${humanPlayer ? Math.floor(humanPlayer.stack) : 1000}</strong></span>
                <span>Lucro/Prejuízo: <strong className={humanPlayer && (humanPlayer.stack - 1000) >= 0 ? "text-emerald-400" : "text-rose-400"}>{(humanPlayer ? humanPlayer.stack - 1000 : 0) > 0 ? '+' : ''}${Math.floor(humanPlayer ? Math.abs(humanPlayer.stack - 1000) : 0)}</strong></span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                <button onClick={() => handleLeave(true)} className="h-10 sm:h-12 bg-sky-500/20 text-sky-400 font-bold uppercase rounded-2xl flex items-center justify-center border border-sky-500/30 text-[10px] sm:text-xs active:scale-95 transition-all">
                  Sair e Continuar Depois
                </button>
                <button onClick={() => handleLeave(false)} className="h-10 sm:h-12 bg-rose-500/20 text-rose-400 font-bold uppercase rounded-2xl flex items-center justify-center border border-rose-500/30 text-[10px] sm:text-xs active:scale-95 transition-all">
                  Abandonar Partida
                </button>
                <button onClick={() => setShowLeaveConfirm(false)} className="h-10 sm:h-12 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-2xl flex items-center justify-center text-[10px] sm:text-xs mt-2 active:scale-95 transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Gradients */}
      <div className="fixed top-0 left-0 w-full h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)] pointer-events-none -z-10" />
    </div>
  );
}

