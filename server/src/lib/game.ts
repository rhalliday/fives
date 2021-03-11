import Deck from "./cards/deck";
import Player from "./players/player";
import Players from "./players/players";
import Card from "./cards/card";
import { Socket } from "socket.io";
import SocketAdaptor from "./socketAdapter";
import Rule from "./rules/rule";
import Rules from "./rules/rules";

const TIME_TO_SHUFFLE = 10_000;

export default class Game {
  players: Players;
  deck: Deck;
  discards: Card[];
  currentRound: Rule;
  rules: Rules;
  io: SocketAdaptor;
  currentPlayer: Player;
  gameStarted: boolean;
  allPlayersHavePlayed: boolean;

  constructor(io: SocketAdaptor) {
    this.players = new Players(io, this.error);
    this.rules = new Rules();
    this.currentRound = this.rules.next();
    this.io = io;
    this.gameStarted = false;
    this.allPlayersHavePlayed = false;
  }

  addPlayer(username: string, socket: Socket, gameRoom: string) {
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
    socket.join(gameRoom);
    this.players.sendPlayers();
  }

  startGame() {
    this.players.shuffle();
    this.players.setAllPlayers(
      (player: Player) => (player.canStartGame = false)
    );
    this.gameStarted = true;
    this.dealRound();
  }

  dealRound() {
    // TODO: increase the number of packs depending on the number of players
    this.deck = new Deck(2);
    this.deck.shuffle();
    this.discards = this.deck.deal(1);
    this.players.setAllPlayers((player: Player) => {
      player.hasGoneDown = false;
      player.canGoDown = false;
    });
    this.players.setIterator(this.rules.currentRule);
    this.players.dealCards(this.deck, this.discards, this.currentRound);
    this.sendMessage("waiting for player to pick up");
    this.allPlayersHavePlayed = false;
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
    this.io.updateGameRoom("setDiscards", discards);
  }

  sendMessage(message: string) {
    this.io.updateGameRoom("setMessage", message);
  }

  finishRound() {
    this.players.updateScores();
    if (this.rules.hasNext()) {
      setTimeout(this.dealRound, TIME_TO_SHUFFLE);
    }
  }

  nextPlayer() {
    this.players.sendCurrentPlayer();
    this.sendMessage("waiting for player to pick up");
    if (!this.allPlayersHavePlayed && this.players.allPlayersHavePlayed()) {
      this.allPlayersHavePlayed = true;
      this.players.setAllPlayers((player: Player) => (player.canGoDown = true));
    }
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
