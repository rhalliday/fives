import Player from "./player";
import Card from "../cards/card";

let player: Player;

beforeEach(() => {
  player = new Player("testSock", "bob");
});

test("can clear socket", () => {
  player.clearSocket();
  expect(player.socketId).toEqual("");
});

test("can set socket", () => {
  player.setSocket("mySock");
  expect(player.socketId).toEqual("mySock");
});

test("can set table", () => {
  const table: Card[][] = [
    generateCardGroup([
      ["Q", "S"],
      ["K", "S"],
      ["A", "S"],
    ]),
    generateCardGroup([
      ["Q", "H"],
      ["K", "H"],
      ["A", "H"],
    ]),
  ];
  player.setTable(table);
  expect(player.table).toBe(table);
});

test("can set hand", () => {
  const hand: Card[] = generateCardGroup([
    ["A", "C"],
    ["2", "D"],
    ["4", "S"],
  ]);
  player.setHand(hand);
  expect(player.hand).toBe(hand);
});

test("can add score", () => {
  expect(player.score).toEqual(0);
  player.addScore(10);
  expect(player.score).toEqual(10);
  player.addScore(100);
  expect(player.score).toEqual(110);
});

test("player validity", () => {
  expect(player.isValid()).toBeTruthy();
  player.clearSocket();
  expect(player.isValid()).toBeFalsy();
  player.setSocket("numero1");
  expect(player.isValid()).toBeTruthy();
  player.username = "";
  expect(player.isValid()).toBeFalsy();
  player.username = "fred";
  expect(player.isValid()).toBeTruthy();
});

describe("ending a players turn", () => {
  test("ending a turn with an empty table", () => {
    player.hasDrawn = true;
    player.endTurn();
    expect(player.hasDrawn).toBeFalsy();
    expect(player.hasGoneDown).toBeFalsy();
  });
  test("ending a turn with a populated table", () => {
    player.hasDrawn = true;
    player.setTable([[new Card("A", "S")]]);
    player.endTurn();
    expect(player.hasDrawn).toBeFalsy();
    expect(player.hasGoneDown).toBeTruthy();
  });
});

function generateCardGroup(cards: string[][]): Card[] {
  return cards.map((card) => new Card(card[0], card[1]));
}
