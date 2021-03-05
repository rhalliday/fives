const validSuits = ["C", "D", "H", "S"];
const validRanks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function validateSuit(suit: string) {
  if (validSuits.find((s) => s === suit) === undefined) {
    throw new Error("Card has invalid suit: " + suit);
  }
}

function validateRank(rank: string) {
  if (validRanks.find((r) => r === rank) === undefined) {
    throw new Error("Card has invalid rank: " + rank);
  }
}

export default class Card {
  rank: string;
  suit: string;
  selected: boolean;
  constructor(rank: string, suit: string) {
    validateSuit(suit);
    validateRank(rank);
    this.rank = rank;
    this.suit = suit;
    this.selected = false;
  }
}
