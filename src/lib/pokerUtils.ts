import { Suit, Rank, CardData } from '../types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck(): CardData[] {
  const deck: CardData[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function formatCardForLog(card: CardData): string {
  const suitSymbol: Record<Suit, string> = {
    'spades': '♠', 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣'
  };
  return `${card.rank}${suitSymbol[card.suit]}`;
}

export function cardToString(card: CardData): string {
  const rankMap: Record<Rank, string> = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': 'T',
    'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
  };
  const suitMap: Record<Suit, string> = {
    'spades': 's', 'hearts': 'h', 'diamonds': 'd', 'clubs': 'c'
  };
  return `${rankMap[card.rank]}${suitMap[card.suit]}`;
}

export function stringToCard(str: string): CardData {
  // pokersolver might return '10s' or 'Ts'
  const isTen = str.length === 3;
  const rankPart = isTen ? '10' : str[0].toUpperCase();
  const suitChar = (isTen ? str[2] : str[1]).toLowerCase();

  const rankReverse: Record<string, Rank> = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', 'T': '10',
    'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
  };
  const suitReverse: Record<string, Suit> = {
    's': 'spades', 'h': 'hearts', 'd': 'diamonds', 'c': 'clubs'
  };

  return {
    rank: rankReverse[rankPart] || 'A',
    suit: suitReverse[suitChar] || 'spades'
  };
}

export function getHandRank(hand: any): number {
  if (!hand) return 0;
  const ranks: Record<string, number> = {
    'High Card': 0, 'Pair': 1, 'Two Pair': 2, 'Three of a Kind': 3,
    'Straight': 4, 'Flush': 5, 'Full House': 6, 'Four of a Kind': 7,
    'Straight Flush': 8, 'Royal Flush': 9
  };
  return ranks[hand.name] || 0;
}
