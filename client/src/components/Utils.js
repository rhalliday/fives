export function getImageLocation(imageName) {
  return process.env.PUBLIC_URL + "/images/" + imageName + ".svg";
}

export function getCardImageName(card) {
  if (card.hasOwnProperty("rank")) return card.rank + card.suit;
  return "AS";
}
