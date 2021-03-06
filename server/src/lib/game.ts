import Deck from "./deck";
import Player from "./player";
import Players from "./players";
import Card from "./card";
import { Server, Socket } from "socket.io";

const TIME_TO_SHUFFLE = 10_000;

export default class Game {
  players: Players;
  deck: Deck;
  discards: Card[];
  currentRound: number;
  io: Server;
  gameRoom: string;
  currentPlayer: Player;
  gameStarted: boolean;

  constructor(io: Server, gameRoom: string) {
    this.players = new Players(io, this.error, gameRoom);
    this.currentRound = 0;
    this.io = io;
    this.gameRoom = gameRoom;
    this.gameStarted = false;
  }

  addPlayer(username: string, socket: Socket) {
    let existingPlayer = this.players.findPlayerByUsername(username);
    if (existingPlayer) {
      if (this.gameStarted) {
        existingPlayer.setSocket(socket.id);
      } else {
        socket.emit(
          "userExists",
          username + " username is taken! Try some other username."
        );
        return;
      }
    } else {
      if (this.gameStarted) return;
      existingPlayer = new Player(socket.id, username);
      this.players.addPlayer(existingPlayer);
    }
    // TODO: consolidate userSet and setUserData
    socket.emit("userSet", existingPlayer.username);
    socket.emit("setUserData", existingPlayer);
    socket.join(this.gameRoom);
    this.players.sendPlayers();
  }

  startGame() {
    this.players.shuffle();
    this.currentRound = 0;
    this.gameStarted = true;
    this.dealRound();
  }

  dealRound() {
    // TODO: increase the number of packs depending on the number of players
    this.deck = new Deck(2);
    this.deck.shuffle();
    this.discards = this.deck.deal(1);
    this.players.setIterator(this.currentRound);
    this.players.dealCards(this.deck, this.discards, this.currentRound);
    this.sendMessage("waiting for player to pick up");
    this.currentRound++;
  }

  dealCard() {
    return this.deck.deal(1);
  }

  setTable(username: string, table: Card[][]) {
    const player = this.players.findPlayerByUsername(username);
    player.setTable(table);
    this.players.sendPlayers();
  }

  setHand(username: string, hand: Card[]) {
    const player = this.players.findPlayerByUsername(username);
    if (player) {
      player.setHand(hand);
    } else {
      this.error("Unable to find user: " + username);
    }
  }

  setDiscards(discards: Card[]) {
    this.discards = discards;
    this.io.in(this.gameRoom).emit("setDiscards", discards);
  }

  sendMessage(message: string) {
    this.io.in(this.gameRoom).emit("setMessage", message);
  }

  finishRound() {
    this.players.updateScores();
    setTimeout(this.dealRound, TIME_TO_SHUFFLE);
  }

  nextPlayer() {
    this.players.sendCurrentPlayer();
    this.sendMessage("waiting for player to pick up");
  }

  disconnectPlayer(socketId: string) {
    // allow the player to reconnect with the same username but a different socketId
    let player = this.players.findPlayerBySocketID(socketId);
    if (player) {
      console.log(
        "A user disconnected: " + player.username + "(" + player.socketId + ")"
      );
      player.clearSocket();
      this.players.sendPlayers();
    } else {
      console.log("unknown user left the game");
    }
  }

  error(message: string) {
    this.sendMessage(message);
    throw new Error(message);
  }
}
