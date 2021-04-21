import Game from "./game";
import Player from "./players/player";
import GameRoomUpdater from "./test/gameRoomUpdater";
import Card from "./cards/card";
import TestSocket from "./test/testSocket";

describe("individual tests", () => {
  let gameRoomUpdater: GameRoomUpdater;
  let game: Game;
  beforeEach(() => {
    jest.useFakeTimers();
    gameRoomUpdater = new GameRoomUpdater();
    game = new Game(gameRoomUpdater.getRoomUpdateFunction());
  });

  describe("add player tests", () => {
    test("can add a new player", () => {
      let playerSocket = new TestSocket("sock1");
      addPlayerTest(game, gameRoomUpdater, playerSocket);
    });
    test("can't add a player if they already exist", () => {
      let playerSocket = new TestSocket("sock1");
      addPlayerTest(game, gameRoomUpdater, playerSocket);
      playerSocket.id = "sock2";
      game.addPlayer("bob", playerSocket, "game");
      expect(game.players.players.length).toEqual(1);
      expect(playerSocket.socketMessages.length).toEqual(1);
      let playerEmit = playerSocket.socketMessages.shift();
      expect(playerEmit.nsp).toEqual("userExists");
    });
    test("can add a player if they already exist, but the socket is not set", () => {
      let playerSocket = new TestSocket("sock1");
      addPlayerTest(game, gameRoomUpdater, playerSocket);
      game.players.players[0].clearSocket();
      playerSocket.id = "sock2";
      game.addPlayer("bob", playerSocket, "game");
      expect(game.players.players.length).toEqual(1);
      expect(playerSocket.socketMessages.length).toEqual(1);
      let playerEmit = playerSocket.socketMessages.shift();
      expect(playerEmit.nsp).toEqual("userSet");
    });
    test("can't add a new player if the game has started", () => {
      game.gameStarted = true;
      game.addPlayer("bob", new TestSocket("sock1"), "game");
      expect(game.players.players.length).toEqual(0);
    });
    test("player can re-join running game if disconnected", () => {
      let playerSocket = new TestSocket("sock1");
      addPlayerTest(game, gameRoomUpdater, playerSocket);
      game.players.players[0].clearSocket();
      playerSocket.id = "sock2";
      game.gameStarted = true;
      game.addPlayer("bob", playerSocket, "game");
      expect(game.players.players.length).toEqual(1);
      expect(playerSocket.socketMessages.length).toEqual(2);
      let playerEmit = playerSocket.socketMessages.shift();
      expect(playerEmit.nsp).toEqual("setCurrentRound");
      playerEmit = playerSocket.socketMessages.shift();
      expect(playerEmit.nsp).toEqual("userSet");
    });
    test("new player can't override existing player", () => {
      game.addPlayer("bob", new TestSocket("sock1"), "game");
      expect(game.players.players.length).toEqual(1);
      game.gameStarted = true;
      game.addPlayer("bob", new TestSocket("sock2"), "game");
      expect(game.players.players.length).toEqual(1);
      expect(game.players.players[0].socketId).toEqual("sock1");
    });
  });

  test("error sends message to all sockets", () => {
    expect(() => game.error("test error")).toThrowError(/test error/);
    let roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual("setMessage");
    expect(roomUpdate.data).toEqual("test error");
  });

  test("send message", () => {
    let msg = "This is a test";
    game.sendMessage(msg);
    let roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual("setMessage");
    expect(roomUpdate.data).toEqual(msg);
  });

  describe("disconnect player", () => {
    test("an existing player", () => {
      let playerSocket = new TestSocket("sock1");
      game.addPlayer("bob", playerSocket, "game");
      game.disconnectPlayer(playerSocket.id);
      let roomUpdate = gameRoomUpdater.getRoomUpdate();
      expect(roomUpdate.nsp).toEqual("setPlayers");
    });
    test("a player who doesn't exist", () => {
      game.disconnectPlayer("monkey");
      expect(gameRoomUpdater.getRoomUpdate()).toBeUndefined();
    });
  });

  describe("set table", () => {
    const table = [[new Card("A", "S")]];
    test("existing player", () => {
      let playerSocket = new TestSocket("sock1");
      game.addPlayer("bob", playerSocket, "game");
      game.setTable("bob", table);
      let roomUpdate = gameRoomUpdater.getRoomUpdate();
      expect(roomUpdate.nsp).toEqual("setPlayers");
      expect(game.players.players[0].table.length).toEqual(1);
    });
    test("player doesn't exist", () => {
      expect(() => game.setTable("bill", table)).toThrowError(
        /Unable to find user: bill/
      );
    });
  });

  test("existing player", () => {
    const hand = [new Card("A", "S")];
    let playerSocket = new TestSocket("sock1");
    game.addPlayer("bob", playerSocket, "game");
    game.currentPlayer = game.players.players[0];
    game.setHand(hand);
    expect(game.players.players[0].hand.length).toEqual(1);
  });
});

describe("general game play", () => {
  let gameRoomUpdater: GameRoomUpdater;
  let game: Game;
  let expectedPlayers: Map<string, Player>;
  let played: string[] = [];
  beforeEach(() => {
    jest.useFakeTimers();
  });
  expectedPlayers = new Map([
    ["sock1", new Player("sock1", "rob")],
    ["sock2", new Player("sock2", "jen")],
    ["sock3", new Player("sock3", "amb")],
    ["sock4", new Player("sock4", "imo")],
  ]);
  gameRoomUpdater = new GameRoomUpdater();
  game = new Game(gameRoomUpdater.getRoomUpdateFunction());
  test("game setup", () => {
    setUpGame(game, expectedPlayers);
    let gameStarters = game.players.players.filter((p) => p.canStartGame);
    expect(gameStarters.length).toEqual(1);
    game.startGame();
    checkStartOfGame(game);
  });
  test("first round", () => {
    played.push(game.currentPlayer.username);
    // current player draws from the deck
    game.drawFromDeck();
    // current player can draw from the deck
    expect(game.currentPlayer.hand.length).toEqual(14);
    discardCard(game, 2);
    played.push(game.currentPlayer.username);
    game.drawFromDiscard();
    expect(game.discards.length).toEqual(1);
    expect(game.currentPlayer.hand.length).toEqual(14);
    discardCard(game, 2);
    played.push(game.currentPlayer.username);
    game.drawFromDeck();
    discardCard(game, 3);
    played.push(game.currentPlayer.username);
    const distinctPlayers = getDistinctPlayers(played);
    expect(distinctPlayers.length).toEqual(4);
    game.drawFromDeck();
    discardCard(game, 4);
  });
  test("round completion", () => {
    played.push(game.currentPlayer.username);
    expect(game.currentPlayer.username).toEqual(played[0]);
    const distinctPlayers = getDistinctPlayers(played);
    expect(distinctPlayers.length).toEqual(4);
    expect(game.allPlayersHavePlayed).toBe(true);
    game.players.players.forEach((p) => expect(p.canGoDown).toBeTruthy());
    game.drawFromDeck();
    game.discard(new Card("A", "S"), []);
    jest.runAllTimers();
    expect(game.currentRound.numSets).toEqual(2);
    expect(game.currentRound.setSize).toEqual(3);
    expect(game.discards.length).toEqual(1);
  });
  test("second round", () => {
    for (let i = 0; i < 4; i++) {
      game.drawFromDiscard();
      discardCard(game, 1);
    }
    // sets of two test
    let player = game.findPlayerByUsername(game.currentPlayer.username);
    let table = [[new Card("A", "S"), new Card("2", "S"), new Card("3", "S")]];
    game.drawFromDiscard();
    game.setTable(player.username, table);
    expect(game.currentPlayer.table).toEqual(table);
    expect(game.currentPlayer.hasGoneDown).toBeFalsy();
    table.push([new Card("A", "H"), new Card("2", "H"), new Card("3", "H")]);
    game.setTable(player.username, table);
    expect(game.currentPlayer.table).toEqual(table);
    expect(game.currentPlayer.hasGoneDown).toBeFalsy();
    discardCard(game, 1);
    expect(player.hasGoneDown).toBeTruthy();
  });
});

function discardCard(game: Game, discardLength: number) {
  let discard = game.currentPlayer.hand.pop();
  let currentPlayer = game.currentPlayer.username;
  game.discard(discard, game.currentPlayer.hand);
  expect(game.discards.length).toEqual(discardLength);
  expect(game.currentPlayer.username).not.toEqual(currentPlayer);
}

function checkStartOfGame(game: Game) {
  expect(game.gameStarted).toBeTruthy();
  let gameStarters = game.players.players.filter((p) => p.canStartGame);
  expect(gameStarters.length).toEqual(0);
  game.players.players.forEach((p) => expect(p.hand.length).toEqual(13));
  expect(game.discards.length).toBe(1);
  expect(game.currentPlayer).toBeDefined();
}

function setUpGame(game: Game, expectedPlayers: Map<string, Player>) {
  // set up some players
  expectedPlayers.forEach((player: Player, sock: string) => {
    const pSocket = new TestSocket(sock);
    game.addPlayer(player.username, pSocket, "game");
  });
}

function addPlayerTest(
  game: Game,
  gameRoomUpdater: GameRoomUpdater,
  playerSocket: TestSocket
) {
  game.addPlayer("bob", playerSocket, "game");
  expect(game.players.players.length).toEqual(1);
  expect(playerSocket.socketMessages.length).toEqual(1);
  let playerEmit = playerSocket.socketMessages.shift();
  expect(playerEmit.nsp).toEqual("userSet");
  expect(playerEmit.data).toEqual("bob");
  expect(playerSocket.gameRoom).toEqual("game");
  let roomUpdate = gameRoomUpdater.getRoomUpdate();
  expect(roomUpdate.nsp).toEqual("setPlayers");
}

function getDistinctPlayers(played: string[]) {
  return played.filter((n, i) => played.indexOf(n) === i);
}
