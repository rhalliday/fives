import { test } from "picomatch";
import { isBlackTwo, sameRank, isStraight, validator, score } from "./fives";

test("isBlackTwo identifies the 2 of clubs", () => {
  expect(isBlackTwo({ rank: "2", suit: "C" })).toBe(true);
});

test("isBlackTwo identifies the 2 of spades", () => {
  expect(isBlackTwo({ rank: "2", suit: "S" })).toBe(true);
});

test("isBlackTwo false for the 2 of hearts", () => {
  expect(isBlackTwo({ rank: "2", suit: "H" })).toBe(false);
});

test("isBlackTwo false for the 2 of diamonds", () => {
  expect(isBlackTwo({ rank: "2", suit: "D" })).toBe(false);
});

test("isBlackTwo false the 3 of clubs", () => {
  expect(isBlackTwo({ rank: "3", suit: "C" })).toBe(false);
});

test("sameRank should return true if they're all the same rank", () => {
  let cards = [
    { rank: "3", suit: "H" },
    { rank: "3", suit: "D" },
    { rank: "3", suit: "C" },
  ];
  expect(sameRank(cards)).toBe(true);
});

test("sameRank should return false if they're not all the same rank", () => {
  let cards = [
    { rank: "3", suit: "H" },
    { rank: "3", suit: "D" },
    { rank: "4", suit: "C" },
  ];
  expect(sameRank(cards)).toBe(false);
});

test("sameRank should take into account black 2's", () => {
  let cards = [
    { rank: "3", suit: "H" },
    { rank: "3", suit: "D" },
    { rank: "2", suit: "C" },
  ];
  expect(sameRank(cards)).toBe(true);
});

test("isStraight returns true if it is a straight", () => {
  let cards = [
    { rank: "3", suit: "H" },
    { rank: "4", suit: "H" },
    { rank: "5", suit: "H" },
  ];
  expect(isStraight(cards)).toBe(true);
});

test("isStraight returns true aces low", () => {
  let cards = [
    { rank: "A", suit: "H" },
    { rank: "2", suit: "H" },
    { rank: "3", suit: "H" },
  ];
  expect(isStraight(cards)).toBe(true);
});

test("isStraight returns true aces high", () => {
  let cards = [
    { rank: "10", suit: "H" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(isStraight(cards)).toBe(true);
});

test("isStraight returns true with black 2", () => {
  let cards = [
    { rank: "10", suit: "H" },
    { rank: "J", suit: "H" },
    { rank: "2", suit: "C" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(isStraight(cards)).toBe(true);
});

test("isStraight returns false if not run", () => {
  let cards = [
    { rank: "10", suit: "H" },
    { rank: "J", suit: "H" },
    { rank: "2", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(isStraight(cards)).toBe(false);
});

test("validator 4 of a kind", () => {
  let cards = [
    { rank: "3", suit: "H" },
    { rank: "3", suit: "D" },
    { rank: "3", suit: "C" },
    { rank: "3", suit: "C" },
  ];
  expect(validator(cards)).toBe(true);
});

test("validator 4 of a kind - black 2", () => {
  let cards = [
    { rank: "2", suit: "S" },
    { rank: "3", suit: "D" },
    { rank: "3", suit: "C" },
    { rank: "3", suit: "C" },
  ];
  expect(validator(cards)).toBe(true);
});

test("validator 4 of a kind - red 2", () => {
  let cards = [
    { rank: "2", suit: "D" },
    { rank: "3", suit: "D" },
    { rank: "3", suit: "C" },
    { rank: "3", suit: "C" },
  ];
  expect(validator(cards)).toBe(false);
});

test("validator straight", () => {
  let cards = [
    { rank: "10", suit: "H" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(validator(cards)).toBe(true);
});

test("validator straight, black 2", () => {
  let cards = [
    { rank: "2", suit: "C" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(validator(cards)).toBe(true);
});

test("validator straight, red 2", () => {
  let cards = [
    { rank: "2", suit: "D" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(validator(cards)).toBe(false);
});

test("score handles face and unit cards", () => {
  let cards = [
    { rank: "2", suit: "D" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(score(cards)).toBe(47);
});

test("black 2 doubles the score", () => {
  let cards = [
    { rank: "2", suit: "S" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "A", suit: "H" },
  ];
  expect(score(cards)).toBe(90);
});

test("2 black 2 quadruples the score", () => {
  let cards = [
    { rank: "2", suit: "S" },
    { rank: "J", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "K", suit: "H" },
    { rank: "2", suit: "C" },
  ];
  expect(score(cards)).toBe(120);
});

test("no cards is a score of 0", () => {
  expect(score([])).toBe(0);
});
