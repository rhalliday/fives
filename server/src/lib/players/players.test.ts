import Player from "./player";
import Players from "./players";
import SocketAdaptor from "../socketAdapter";
import Card from "../cards/card";
import Deck from "../cards/deck";
import Rule from "../rules/rule";

let socketAdapter: SocketAdaptor;
let players: Players;
type roomUpdateType = { type: string; data: any };
let roomUpdates: roomUpdateType[];
let expectedPlayers: Map<String, Player>;
let messagedSockets: string[];
let errorMessage: string;

const setPlayerType = "setPlayers";
const setCurrentPlayerType = "setCurrentPlayer";

beforeEach(() => {
  messagedSockets = [];
  roomUpdates = [];
  expectedPlayers = new Map([
    ["sock1", new Player("sock1", "rob")],
    ["sock2", new Player("sock2", "jen")],
    ["sock3", new Player("sock3", "amb")],
    ["sock4", new Player("sock4", "imo")],
  ]);
  socketAdapter = new SocketAdaptor(
    (type: string, data: any) => {
      roomUpdates.push({ type: type, data: data });
    },
    () => expectedPlayers,
    (key: string, type: string, data: any) => {
      messagedSockets.push(key);
      expect(type).toEqual("dealtCards");
      expect(data.cards).toBeDefined();
      expect(data.discards).toBeDefined();
      expect(data.currentRound).toBeDefined();
    }
  );
  players = new Players(
    socketAdapter,
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
  players.setIterator(1);
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
    players.players[0].socketId = "sock7";
    players.players[players.players.length - 1].socketId = "sock8";
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
  let roomUpdate = roomUpdates.pop();
  expect(roomUpdate.type).toEqual(setPlayerType);
  expect(roomUpdate.data).toBe(players.players);
});

test("sendCurrentPlayer sends the currentPlayer to the room", () => {
  players.sendCurrentPlayer();
  let roomUpdate = roomUpdates.pop();
  expect(roomUpdate.type).toEqual(setCurrentPlayerType);
  expect(roomUpdate.data).toEqual(players.players[0].username);
  players.sendCurrentPlayer();
  roomUpdate = roomUpdates.pop();
  expect(roomUpdate.type).toEqual(setCurrentPlayerType);
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
  let roomUpdate = roomUpdates.pop();
  expect(roomUpdate.type).toEqual(setPlayerType);
  roomUpdate.data.forEach((player: Player) =>
    expect(player.score).toEqual(expectedScores.shift())
  );
  expect(expectedScores.length).toEqual(0);
});

describe("deal cards", () => {
  test("deal with everyone there", () => {
    const deck = new Deck(2);
    const discards = deck.deal(1);
    const rule = new Rule(1, 3, "One Three");
    players.setAllPlayers((p: Player) => p.setTable([[new Card("A", "S")]]));
    players.dealCards(deck, discards, rule);
    expect(messagedSockets.length).toEqual(players.players.length);
    const distinctArray = messagedSockets.filter(
      (n, i) => messagedSockets.indexOf(n) === i
    );
    expect(distinctArray.length).toEqual(players.players.length);
    const emptyHand = players.players.filter((p) => p.hand.length === 0);
    expect(emptyHand.length).toEqual(0);
    const tables = players.players.filter((p) => p.table.length > 0);
    expect(tables.length).toEqual(0);
    let roomUpdate = roomUpdates.shift();
    expect(roomUpdate.type).toEqual(setPlayerType);
    roomUpdate = roomUpdates.shift();
    expect(roomUpdate.type).toEqual(setCurrentPlayerType);
  });
  test("deal with someone missing", () => {
    const deck = new Deck(2);
    const discards = deck.deal(1);
    const rule = new Rule(1, 3, "One Three");
    players.players[0].clearSocket();
    players.dealCards(deck, discards, rule);
    expect(messagedSockets.length).toEqual(players.players.length - 1);
    const distinctArray = messagedSockets.filter(
      (n, i) => messagedSockets.indexOf(n) === i
    );
    expect(distinctArray.length).toEqual(players.players.length - 1);
    const emptyHand = players.players.filter((p) => p.hand.length === 0);
    expect(emptyHand.length).toEqual(0);
    const tables = players.players.filter((p) => p.table.length > 0);
    expect(tables.length).toEqual(0);
    let roomUpdate = roomUpdates.shift();
    expect(roomUpdate.type).toEqual(setPlayerType);
    roomUpdate = roomUpdates.shift();
    expect(roomUpdate.type).toEqual(setCurrentPlayerType);
  });
});

test("shuffle doesn't remove/add any players", () => {
  const numPlayers = players.players.length;
  players.shuffle();
  expect(players.players.length).toEqual(numPlayers);
});
