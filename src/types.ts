export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface CardData {
  rank: Rank;
  suit: Suit;
}

export type Position = "SB" | "BB" | "UTG" | "HJ" | "CO" | "BTN";

export interface Player {
  id: string;
  name: string;
  position: Position;
  stack: number;
  initialStack: number;
  bet: number;
  cards?: CardData[];
  isActive: boolean;
  isFolded: boolean;
  isDealer: boolean;
  isWinner?: boolean;
  isHuman: boolean;
  avatar?: string;
  lastAction?: string;
  winningHandDesc?: string;
  handDesc?: string;
  bestCards?: CardData[];
  hasActed?: boolean;
  speech?: { text: string; expiresAt: number };
}

export type Phase = "Waiting" | "Pre-flop" | "Flop" | "Turn" | "River" | "Showdown";

export interface GameState {
  pot: number;
  communityCards: CardData[];
  players: Player[];
  phase: Phase;
  dealerIndex: number;
  currentTurnIndex: number;
  pendingNextTurnIndex?: number;
  currentBet: number;
  minRaise: number;
  deck: CardData[];
  actionLog: { id?: string; playerName: string; action: string }[];
  fastForward: boolean;
}
