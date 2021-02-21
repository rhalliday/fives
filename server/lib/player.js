module.exports = class Player {
  constructor(socketId, username) {
    this.socketId = socketId;
    this.username = username;
    this.table = [];
    this.hand = [];
    this.score = 0;
  }

  clearSocket() {
    this.setSocket("");
  }

  setSocket(socketId) {
    this.socketId = socketId;
  }

  setTable(table) {
    this.table = table;
  }

  setHand(hand) {
    this.hand = hand;
  }

  addScore(score) {
    this.score += score;
  }
};
