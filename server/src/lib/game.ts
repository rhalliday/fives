import Deck from "./cards/deck";
import Player from "./players/player";
import Players from "./players/players";
import Card from "./cards/card";
import TestSocket from "./test/testSocket";
import Rule from "./rules/rule";
import Rules from "./rules/rules";
import { Server, Socket } from "socket.io";

const TIME_TO_SHUFFLE = 10_000;

export default class Game {
  players: Players;
  deck: Deck;
  discards: Card[];
  currentRound: Rule;
  rules: Rules;
  io: Server;
  currentPlayer: Player;
  gameStarted: boolean;
  allPlayersHavePlayed: boolean;
  updateGameRoom: Function;

  constructor(updateGameRoom: Function) {
    this.players = new Players(updateGameRoom, this.error.bind(this));
    this.rules = new Rules();
    this.currentRound = this.rules.next();
    this.updateGameRoom = updateGameRoom;
    this.gameStarted = false;
    this.allPlayersHavePlayed = false;
  }

  addPlayer(username: string, socket: Socket | TestSocket, gameRoom: string) {
    let existingPlayer = this.players.findPlayerByUsername(username);
    if (existingPlayer) {
      if (existingPlayer.isValid()) {
        socket.emit(
          "userExists",
          username + " username is taken! Try some other username."
        );
        return;
      } else {
        existingPlayer.setSocket(socket.id);
        if (this.currentPlayer) {
          this.updateGameRoom("setCurrentPlayer", this.currentPlayer.username);
        }
      }
    } else {
      if (this.gameStarted) return;
      existingPlayer = new Player(socket.id, username);
      this.players.addPlayer(existingPlayer);
    }
    socket.emit("userSet", existingPlayer.username);
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
    this.players.setIterator(this.rules.currentRule);
    this.currentPlayer = this.players.dealCards(this.deck);
    this.updateGameRoom("setCurrentRound", this.currentRound);
    this.updateGameRoom("setDiscards", this.discards);
    this.sendMessage("waiting for player to pick up");
    this.allPlayersHavePlayed = false;
  }

  drawFromDeck() {
    if (this.currentPlayer.hasDrawn) {
      return;
    }
    this.draw(this.deck.deal(1)[0]);
  }

  drawFromDiscard() {
    if (this.currentPlayer.hasDrawn) {
      return;
    }
    this.draw(this.discards.pop());
    this.updateGameRoom("setDiscards", this.discards);
  }

  draw(card: Card) {
    this.currentPlayer.hasDrawn = true;
    this.currentPlayer.hand.push(card);
    this.setHand(this.currentPlayer.hand);
  }

  setTable(username: string, table: Card[][]) {
    const player = this.findPlayerByUsername(username);
    player.setTable(table);
    this.players.sendPlayers();
  }

  setHand(hand: Card[]) {
    this.currentPlayer.setHand(hand);
    this.players.sendPlayers();
  }

  findPlayerByUsername(username: string) {
    const player = this.players.findPlayerByUsername(username);
    if (player) {
      return player;
    }
    this.error("Unable to find user: " + username);
  }

  isCurrentPlayer(socketId: string) {
    return this.currentPlayer.socketId === socketId;
  }

  discard(discard: Card, hand: Card[]) {
    this.discards.push(discard);
    this.setHand(hand);
    this.currentPlayer.endTurn();
    this.updateGameRoom("setDiscards", this.discards);
    if (hand.length > 0) {
      return this.nextPlayer();
    }
    this.finishRound();
  }

  finishRound() {
    this.sendMessage(this.currentPlayer.username + " has chipped!");
    this.players.updateScores();
    if (this.rules.hasNext()) {
      this.currentRound = this.rules.next();
      setTimeout(() => this.dealRound(), TIME_TO_SHUFFLE);
    } else {
      const winner = this.players.getWinner();
      setTimeout(
        () => this.sendMessage(winner.username + " is the winner!"),
        TIME_TO_SHUFFLE
      );
    }
  }

  nextPlayer() {
    this.currentPlayer = this.players.sendCurrentPlayer();
    this.sendMessage("waiting for player to pick up");
    if (!this.allPlayersHavePlayed && this.players.allPlayersHavePlayed()) {
      this.allPlayersHavePlayed = true;
      this.players.setAllPlayers((player: Player) => (player.canGoDown = true));
    }
  }

  sendMessage(message: string) {
    this.updateGameRoom("setMessage", message);
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
