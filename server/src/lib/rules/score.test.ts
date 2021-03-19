import score from "./score";
import Card from "../cards/card";

test("score handles face and unit cards", () => {
  let cards = [
    new Card("2", "D"),
    new Card("J", "H"),
    new Card("Q", "H"),
    new Card("K", "H"),
    new Card("A", "H"),
  ];
  expect(score(cards)).toBe(47);
});

test("black 2 doubles the score", () => {
  let cards = [
    new Card("2", "S"),
    new Card("J", "H"),
    new Card("Q", "H"),
    new Card("K", "H"),
    new Card("A", "H"),
  ];
  expect(score(cards)).toBe(90);
});

test("2 black 2 quadruples the score", () => {
  let cards = [
    new Card("2", "S"),
    new Card("J", "H"),
    new Card("Q", "H"),
    new Card("K", "H"),
    new Card("2", "C"),
  ];
  expect(score(cards)).toBe(120);
});

test("no cards is a score of 0", () => {
  expect(score([])).toBe(0);
});
