import Card from "./card";

test("valid card initialises successfully", () => {
  let suits = ["H", "D", "S", "C"];
  let ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  let validCards = ranks
    .map((r) => suits.map((s) => [r, s]))
    .reduce((prev, curr) => prev.concat(curr));
  validCards.forEach((card) =>
    expect(new Card(card[0], card[1])).toBeDefined()
  );
});

test("invalid card throws error", () => {
  expect(() => new Card("11", "H")).toThrowError(/invalid rank/);
  expect(() => new Card("10", "P")).toThrowError(/invalid suit/);
  expect(() => new Card("H", "A")).toThrowError(/invalid suit/);
});
