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

  isValid() {
    return (
      this.socketId &&
      this.socketId.length > 0 &&
      this.username &&
      this.username.length > 0
    );
  }
};
