import { Card } from "../types/Card";

export function getImageLocation(imageName: string) {
  return process.env.PUBLIC_URL + "/images/" + imageName + ".svg";
}

export function getCardImageName(card: Card) {
  return card.rank + card.suit;
}
