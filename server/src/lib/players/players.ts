import Deck from "../cards/deck";
import Player from "./player";
import score from "../rules/score";

export default class Players {
  players: Player[];
  updateGameRoom: Function;
  errorHandler: Function;
  currentPos: number;
  numPlayed: number;

  constructor(updateGameRoom: Function, errorHandler: Function) {
    this.players = [];
    this.updateGameRoom = updateGameRoom;
    this.errorHandler = errorHandler;
    this.currentPos = 0;
    this.numPlayed = 0;
  }

  addPlayer(player: Player) {
    if (this.players.length === 0) {
      player.canStartGame = true;
    }
    this.players.push(player);
  }

  allPlayersHavePlayed() {
    return this.numPlayed > this.players.length;
  }

  setAllPlayers(modifyCB: Function) {
    this.players.forEach((player) => modifyCB(player));
  }

  setIterator(startPos: number) {
    this.currentPos = startPos - 1;
  }
  nextPlayer() {
    // get next player
    let player = this.players[this.currentPos++ % this.players.length];
    this.numPlayed++;
    // if the player is valid return it, otherwise return the next valid player
    if (player.isValid()) {
      return player;
    }
    // make sure that we have valid players
    if (this.players.find((p) => p.isValid()) === undefined) {
      this.errorHandler("There are no valid players");
      return;
    }
    // loop round till we find the next player
    while (!player.isValid()) {
      player = this.players[this.currentPos++ % this.players.length];
      this.numPlayed++;
    }
    return player;
  }
  dealCards(deck: Deck) {
    this.numPlayed = 0;
    this.players.forEach((player) => {
      player.setHand(deck.deal(13));
      // make sure the players details have been reset
      player.hasGoneDown = false;
      player.canGoDown = false;
      player.hasDrawn = false;
      player.setTable([]);
    });
    this.sendPlayers();
    return this.sendCurrentPlayer();
  }

  sendPlayers() {
    this.updateGameRoom("setPlayers", this.players);
  }

  sendCurrentPlayer() {
    let currentPlayer = this.nextPlayer();
    this.updateGameRoom("setCurrentPlayer", currentPlayer.username);
    return currentPlayer;
  }

  findPlayerByUsername(username: string) {
    return this.players.find((player) => player.username === username);
  }

  findPlayerBySocketID(socketId: string) {
    return this.players.find((player) => player.socketId === socketId);
  }

  shuffle() {
    // shuffle them players
    for (let i = this.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
  }

  updateScores() {
    this.players.forEach((player) => player.addScore(score(player.hand)));
    this.sendPlayers();
  }

  getWinner() {
    return this.players.reduce(
      (p1, p2) => (p1.score < p2.score ? p1 : p2),
      this.players[0]
    );
  }
}
