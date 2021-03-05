import { Card } from "../types/Card";

function cardValue(card: Card, cardValues: { A: number, J: number, Q: number, K: number }) {
  if (card.rank in cardValues) {
    return cardValues[card.rank as keyof typeof cardValues];
  }
  return parseInt(card.rank, 10);
}

function getOrder(card: Card, acesHigh:boolean = true) {
  let cardValues = {
    A: acesHigh ? 14 : 1,
    J: 11,
    Q: 12,
    K: 13,
  };
  return cardValue(card, cardValues);
}

function getInitialCard(cards: Card[]) {
  let initialCard = cards.shift();
  while (initialCard && isBlackTwo(initialCard)) {
    initialCard = cards.shift();
  }
  return initialCard;
}

export function isBlackTwo(card: Card) {
  return card.rank === "2" && (card.suit === "C" || card.suit === "S");
}

export function sameRank(cards: Card[]) {
  let initialCard = getInitialCard(cards);
  if (!initialCard) {
    return false;
  }
  let expected_rank = initialCard.rank;
  return cards.every((card) => {
    return card.rank === expected_rank || isBlackTwo(card);
  });
}

export function isStraight(cards: Card[]) {
  let initialCard = getInitialCard(cards);
  if (!initialCard) {
    return false;
  }
  let cardValue = getOrder(initialCard, false);
  let suit = initialCard.suit;
  return cards.every((card) => {
    cardValue += 1;
    return (
      isBlackTwo(card) || (card.suit === suit && getOrder(card) === cardValue)
    );
  });
}

// are the group of cards valid
export function validator(cardsOriginal: Card[]) {
  // make a copy so that we can mess with it
  let cards = [...cardsOriginal];
  if (cards.length < 3) return false;

  if (sameRank([...cards])) return true;

  return isStraight(cards);
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

export function score(cards: Card[]) {
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

export default validator;
