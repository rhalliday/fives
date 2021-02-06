function getOrder(card, acesHigh = true) {
  let cardValues = {
    A: acesHigh ? 14 : 1,
    J: 11,
    Q: 12,
    K: 13,
  };
  return cardValues[card.rank]
    ? cardValues[card.rank]
    : parseInt(card.rank, 10);
}

function getInitialCard(cards) {
  let initialCard = cards.shift();
  while (isBlackTwo(initialCard)) {
    initialCard = cards.shift();
  }
  return initialCard;
}

export function isBlackTwo(card) {
  return card.rank === "2" && (card.suit === "C" || card.suit === "S");
}

export function sameRank(cards) {
  let expected_rank = getInitialCard(cards).rank;
  return cards.every((card) => {
    return card.rank === expected_rank || isBlackTwo(card);
  });
}

export function isStraight(cards) {
  let initialCard = getInitialCard(cards);
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
export function validator(cards) {
  if (cards.length < 3) return false;

  if (sameRank([...cards])) return true;

  return isStraight(cards);
}

function getValue(card) {
  let cardValues = {
    A: 15,
    J: 10,
    Q: 10,
    K: 10,
  };
  return cardValues[card.rank]
    ? cardValues[card.rank]
    : parseInt(card.rank, 10);
}

export function score(cards) {
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
