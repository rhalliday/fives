import Card from "../cards/card";

export default class Player {
  socketId: string;
  username: string;
  table: Card[][];
  hand: Card[];
  score: number;
  canStartGame: boolean;
  canGoDown: boolean;
  hasGoneDown: boolean;
  hasDrawn: boolean;

  constructor(socketId: string, username: string) {
    this.socketId = socketId;
    this.username = username;
    this.table = [];
    this.hand = [];
    this.score = 0;
    this.canStartGame = false;
    this.canGoDown = false;
    this.hasGoneDown = false;
    this.hasDrawn = false;
  }

  clearSocket() {
    this.socketId = "";
  }

  setSocket(socketId: string) {
    this.socketId = socketId;
  }

  hasSocket() {
    return this.socketId !== "";
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
    return this.socketId && this.username && this.username.length > 0;
  }

  endTurn() {
    this.hasDrawn = false;
    if (this.table.length > 0) {
      this.hasGoneDown = true;
    }
  }
}
