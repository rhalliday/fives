import Card from "./card";

export default class Player {
  socketId: string;
  username: string;
  table: Card[][];
  hand: Card[];
  score: number;
  canStartGame: boolean;
  canGoDown: boolean;
  hasGoneDown: boolean;

  constructor(socketId: string, username: string) {
    this.socketId = socketId;
    this.username = username;
    this.table = [];
    this.hand = [];
    this.score = 0;
    this.canStartGame = false;
    this.canGoDown = false;
    this.hasGoneDown = false;
  }

  clearSocket() {
    this.setSocket("");
  }

  setSocket(socketId: string) {
    this.socketId = socketId;
  }

  setTable(table: Card[][]) {
    this.table = table;
  }

  setHand(hand: Card[]) {
    this.hand = hand;
  }

  addScore(score: number) {
    this.score += score;
  }

  isValid() {
    return (
      this.socketId &&
      this.socketId.length > 0 &&
      this.username &&
      this.username.length > 0
    );
  }
}
