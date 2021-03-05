import Card from "./card";

// Deck for use in fives
export default class Deck {
  packs: number;
  deck: Card[];

  constructor(packs: number) {
    this.packs = packs;
    this.deck = [];
    for (let count = 0; count < this.packs; count++) {
      this.deck = this.deck.concat(this.generatePack());
    }
  }

  // shuffles the cards in the deck
  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // deals the number of cards that were asked for
  deal(numCards: number) {
    if (this.deck.length < numCards) {
      throw new Error("Not enough cards");
    }
    return this.deck.splice(0, numCards);
  }

  generatePack() {
    let suits = ["H", "D", "S", "C"];
    let ranks = [
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
    return ranks
      .map((r) => suits.map((s) => new Card(r, s)))
      .reduce((prev, curr) => prev.concat(curr));
  }
}
