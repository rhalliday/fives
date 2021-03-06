import Card from "./card";

function cardValue(
  card: Card,
  cardValues: { A: number; J: number; Q: number; K: number }
) {
  if (card.rank in cardValues) {
    return cardValues[card.rank as keyof typeof cardValues];
  }
  return parseInt(card.rank, 10);
}

function isBlackTwo(card: Card) {
  return card.rank === "2" && (card.suit === "C" || card.suit === "S");
}

function getValue(card: Card) {
  let cardValues = {
    A: 15,
    J: 10,
    Q: 10,
    K: 10,
  };
  return cardValue(card, cardValues);
}

export default function score(cards: Card[]) {
  let score = 0,
    multipliers = 0;
  cards.forEach((card) => {
    if (isBlackTwo(card)) {
      multipliers = multipliers + 1;
    } else {
      score = score + getValue(card);
    }
  });
  return score * 2 ** multipliers;
}
