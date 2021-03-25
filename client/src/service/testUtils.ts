export function generatePlayer(username: String) {
  const cards = generateCards([
    ["6", "C"],
    ["7", "C"],
    ["8", "C"],
  ]);
  return {
    socketId: "mySock",
    username: username,
    table: [cards, cards],
    hand: cards,
    score: 10,
    canStartGame: false,
    canGoDown: true,
    hasGoneDown: true,
    hasDrawn: false,
  };
}

export function generateCards(cardArray: String[][]) {
  return cardArray.map((card) => generateCard(card[0], card[1]));
}

export function generateCard(rank: String, suit: String) {
  return { rank: rank, suit: suit, selected: false };
}
