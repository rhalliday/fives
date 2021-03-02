export class Card {
  rank: string;
  suit: string;
  selected: boolean;
  constructor(rank: string, suit: string) {
    this.rank = rank;
    this.suit = suit;
    this.selected = false;
  }
}