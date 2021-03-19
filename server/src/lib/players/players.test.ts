import Player from "./player";
import Players from "./players";
import Card from "../cards/card";
import Deck from "../cards/deck";
import GameRoomUpdater from "../test/gameRoomUpdater";

let players: Players;
let expectedPlayers: Map<String, Player>;
let errorMessage: string;
let playerSockets: string[];
let gameRoomUpdater: GameRoomUpdater;

const setPlayerType = "setPlayers";
const setCurrentPlayerType = "setCurrentPlayer";

beforeEach(() => {
  playerSockets = ["sock1", "sock2", "sock3", "sock4"];
  expectedPlayers = new Map([
    [playerSockets[0], new Player(playerSockets[0], "rob")],
    [playerSockets[1], new Player(playerSockets[1], "jen")],
    [playerSockets[2], new Player(playerSockets[2], "amb")],
    [playerSockets[3], new Player(playerSockets[3], "imo")],
  ]);
  gameRoomUpdater = new GameRoomUpdater();
  players = new Players(
    gameRoomUpdater.getRoomUpdateFunction(),
    (message: string) => (errorMessage = message)
  );

  for (let value of expectedPlayers.values()) {
    players.addPlayer(value);
  }
});

test("First player can start game", () =>
  expect(players.players[0].canStartGame).toBeTruthy());

test("All players have played returns true when all players have played", () => {
  expectedPlayers.forEach(() => {
    expect(players.allPlayersHavePlayed()).toBeFalsy();
    players.nextPlayer();
  });
  players.nextPlayer();
  expect(players.allPlayersHavePlayed()).toBeTruthy();
  players.nextPlayer();
  expect(players.allPlayersHavePlayed()).toBeTruthy();
});

test("Set all players", () => {
  players.setAllPlayers((player: Player) => (player.score = 10));
  for (let value of expectedPlayers.values()) {
    expect(value.score).toEqual(10);
  }
});

test("Set iterator", () => {
  players.setIterator(2);
  let p = players.nextPlayer();
  expect(p.socketId).toEqual("sock2");
});

describe("nextPlayer", () => {
  test("Errors if all players are invalid", () => {
    players.setAllPlayers((player: Player) => {
      player.clearSocket();
    });
    players.nextPlayer();
    expect(errorMessage).toEqual("There are no valid players");
  });
  test("Invalid players are skipped", () => {
    players.players[0].clearSocket();
    let p = players.nextPlayer();
    expect(p.socketId).toEqual("sock2");
  });
  test("wrap around works", () => {
    // make all players invalid
    players.setAllPlayers((player: Player) => {
      player.clearSocket();
    });
    players.players[0].setSocket("sock7");
    players.players[players.players.length - 1].setSocket("sock8");
    let p = players.nextPlayer();
    expect(p.socketId).toEqual("sock7");
    p = players.nextPlayer();
    expect(p.socketId).toEqual("sock8");
    p = players.nextPlayer();
    expect(p.socketId).toEqual("sock7");
  });
});

test("sendPlayers sends the players to the room", () => {
  players.sendPlayers();
  let roomUpdate = gameRoomUpdater.getRoomUpdate();
  expect(roomUpdate.nsp).toEqual(setPlayerType);
  expect(roomUpdate.data).toBe(players.players);
});

test("sendCurrentPlayer sends the currentPlayer to the room", () => {
  players.sendCurrentPlayer();
  let roomUpdate = gameRoomUpdater.getRoomUpdate();
  expect(roomUpdate.nsp).toEqual(setCurrentPlayerType);
  expect(roomUpdate.data).toEqual(players.players[0].username);
  players.sendCurrentPlayer();
  roomUpdate = gameRoomUpdater.getRoomUpdate();
  expect(roomUpdate.nsp).toEqual(setCurrentPlayerType);
  expect(roomUpdate.data).toEqual(players.players[1].username);
});

describe("finding a player by username", () => {
  test("finding an existing player", () => {
    let player = players.findPlayerByUsername("amb");
    expect(player.socketId).toEqual("sock3");
  });
  test("looking for a player that doesn't exist", () => {
    expect(players.findPlayerByUsername("testUser")).toBeUndefined();
  });
});

describe("finding a player by socket ID", () => {
  test("finding an existing player", () => {
    let player = players.findPlayerBySocketID("sock4");
    expect(player.username).toEqual("imo");
  });
  test("looking for a player that doesn't exist", () => {
    expect(players.findPlayerBySocketID("testUser")).toBeUndefined();
  });
});

test("updating users scores", () => {
  let hands = [
    [],
    [new Card("2", "H"), new Card("3", "H")],
    [new Card("10", "H")],
    [new Card("3", "C"), new Card("4", "C")],
  ];
  let expectedScores = [0, 5, 10, 7];
  // assign the hands to the players
  players.players.forEach((player) => player.setHand(hands.shift()));
  players.updateScores();
  let roomUpdate = gameRoomUpdater.getRoomUpdate();
  expect(roomUpdate.nsp).toEqual(setPlayerType);
  roomUpdate.data.forEach((player: Player) =>
    expect(player.score).toEqual(expectedScores.shift())
  );
  expect(expectedScores.length).toEqual(0);
});

describe("deal cards", () => {
  test("deal with everyone there", () => {
    const deck = new Deck(2);
    players.setAllPlayers((p: Player) => p.setTable([[new Card("A", "S")]]));
    players.dealCards(deck);
    const emptyHand = players.players.filter((p) => p.hand.length === 0);
    expect(emptyHand.length).toEqual(0);
    const tables = players.players.filter((p) => p.table.length > 0);
    expect(tables.length).toEqual(0);
    let roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual(setPlayerType);
    roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual(setCurrentPlayerType);
  });
  test("deal with someone missing", () => {
    const deck = new Deck(2);
    players.players[0].clearSocket();
    players.dealCards(deck);
    const emptyHand = players.players.filter((p) => p.hand.length === 0);
    expect(emptyHand.length).toEqual(0);
    const tables = players.players.filter((p) => p.table.length > 0);
    expect(tables.length).toEqual(0);
    let roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual(setPlayerType);
    roomUpdate = gameRoomUpdater.getRoomUpdate();
    expect(roomUpdate.nsp).toEqual(setCurrentPlayerType);
  });
});

test("shuffle doesn't remove/add any players", () => {
  const numPlayers = players.players.length;
  players.shuffle();
  expect(players.players.length).toEqual(numPlayers);
});

test("get winner", () => {
  players.players[0].score = 5;
  players.players[1].score = 10;
  players.players[2].score = 2;
  players.players[3].score = 100;
  const winner = players.getWinner();
  expect(winner).toBe(players.players[2]);
});
