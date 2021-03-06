import { Server } from "socket.io";
import Card from "./card";
import Deck from "./deck";
import Player from "./player";
import score from "./score";

export default class Players {
  players: Player[];
  io: Server;
  errorHandler: Function;
  currentPos: number;
  gameRoom: string;

  constructor(io: Server, errorHandler: Function, gameRoom: string) {
    this.gameRoom = gameRoom;
    this.players = [];
    this.io = io;
    this.errorHandler = errorHandler;
    this.currentPos = 0;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  setIterator(startPos: number) {
    this.currentPos = startPos;
  }
  nextPlayer() {
    // get next player
    let player = this.players[this.currentPos++ % this.players.length];
    // if the player is valid return it, otherwise return the next valid player
    if (player.isValid()) {
      return player;
    }
    // make sure that we have valid players
    if (this.players.find((p) => p.isValid()) === undefined) {
      this.errorHandler("There are no valid players");
    }
    // loop round till we find the next player
    while (!player.isValid()) {
      player = this.players[this.currentPos++ % this.players.length];
    }
    return player;
  }
  dealCards(deck: Deck, discards: Card[], currentRound: number) {
    let sockets = this.io.of("/").sockets;
    this.players.forEach((player) => {
      if (sockets.has(player.socketId)) {
        player.setHand(deck.deal(13));
        sockets.get(player.socketId).emit("dealtCards", {
          cards: player.hand,
          discards: discards,
          currentRound: currentRound,
        });
      } else {
        console.log("Could not find socket " + player.socketId);
      }
      // make sure the players details have been reset
      player.setTable([]);
    });
    this.sendPlayers();
    this.sendCurrentPlayer();
  }

  sendPlayers() {
    this.io.in(this.gameRoom).emit("setPlayers", this.players);
  }

  sendCurrentPlayer() {
    let currentPlayer = this.nextPlayer();
    this.io.in(this.gameRoom).emit("setCurrentPlayer", currentPlayer.username);
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
}
