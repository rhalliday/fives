import { Card } from "./Card";

export type Player = {
  socketId: string;
  username: string;
  table: Card[][];
  hand: Card[];
  score: number;
  canStartGame: boolean;
  canGoDown: boolean;
  hasGoneDown: boolean;
  hasDrawn: boolean;
};
