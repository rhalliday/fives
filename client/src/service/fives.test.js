import { isBlackTwo, sameRank, isStraight, validator } from "./fives";

describe("isBlackTwo", () => {
  it("identifies the 2 of clubs", () => {
    expect(isBlackTwo({ rank: "2", suit: "C" })).toBeTruthy();
  });

  it("identifies the 2 of spades", () => {
    expect(isBlackTwo({ rank: "2", suit: "S" })).toBeTruthy();
  });

  it("false for the 2 of hearts", () => {
    expect(isBlackTwo({ rank: "2", suit: "H" })).toBeFalsy();
  });

  it("false for the 2 of diamonds", () => {
    expect(isBlackTwo({ rank: "2", suit: "D" })).toBeFalsy();
  });

  it("false for the 3 of clubs", () => {
    expect(isBlackTwo({ rank: "3", suit: "C" })).toBeFalsy();
  });
});

describe("sameRank", () => {
  it("should return true if they're all the same rank", () => {
    let cards = [
      { rank: "3", suit: "H" },
      { rank: "3", suit: "D" },
      { rank: "3", suit: "C" },
    ];
    expect(sameRank(cards)).toBeTruthy();
  });

  it("should return false if they're not all the same rank", () => {
    let cards = [
      { rank: "3", suit: "H" },
      { rank: "3", suit: "D" },
      { rank: "4", suit: "C" },
    ];
    expect(sameRank(cards)).toBeFalsy();
  });

  it("should take into account black 2's", () => {
    let cards = [
      { rank: "3", suit: "H" },
      { rank: "3", suit: "D" },
      { rank: "2", suit: "C" },
    ];
    expect(sameRank(cards)).toBeTruthy();
  });

  it("should return false if there are no cards", () => {
    expect(sameRank([])).toBeFalsy();
  });
});

describe("isStraight", () => {
  it("returns true if it is a straight", () => {
    let cards = [
      { rank: "3", suit: "H" },
      { rank: "4", suit: "H" },
      { rank: "5", suit: "H" },
    ];
    expect(isStraight(cards)).toBeTruthy();
  });

  it("returns true aces low", () => {
    let cards = [
      { rank: "A", suit: "H" },
      { rank: "2", suit: "H" },
      { rank: "3", suit: "H" },
    ];
    expect(isStraight(cards)).toBeTruthy();
  });

  it("returns true aces high", () => {
    let cards = [
      { rank: "10", suit: "H" },
      { rank: "J", suit: "H" },
      { rank: "Q", suit: "H" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(isStraight(cards)).toBeTruthy();
  });

  it("returns true with black 2", () => {
    let cards = [
      { rank: "10", suit: "H" },
      { rank: "J", suit: "H" },
      { rank: "2", suit: "C" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(isStraight(cards)).toBeTruthy();
  });

  it("returns false if not run", () => {
    let cards = [
      { rank: "10", suit: "H" },
      { rank: "J", suit: "H" },
      { rank: "2", suit: "H" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(isStraight(cards)).toBeFalsy();
  });

  it("returns false when no cards are passed in", () => {
    expect(isStraight([])).toBeFalsy();
  });
});

describe("validator", () => {
  test("4 of a kind", () => {
    let cards = [
      { rank: "3", suit: "H" },
      { rank: "3", suit: "D" },
      { rank: "3", suit: "C" },
      { rank: "3", suit: "C" },
    ];
    expect(validator(cards)).toBeTruthy();
  });

  test("4 of a kind - black 2", () => {
    let cards = [
      { rank: "2", suit: "S" },
      { rank: "3", suit: "D" },
      { rank: "3", suit: "C" },
      { rank: "3", suit: "C" },
    ];
    expect(validator(cards)).toBeTruthy();
  });

  test("4 of a kind - red 2", () => {
    let cards = [
      { rank: "2", suit: "D" },
      { rank: "3", suit: "D" },
      { rank: "3", suit: "C" },
      { rank: "3", suit: "C" },
    ];
    expect(validator(cards)).toBeFalsy();
  });

  test("straight", () => {
    let cards = [
      { rank: "10", suit: "H" },
      { rank: "J", suit: "H" },
      { rank: "Q", suit: "H" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(validator(cards)).toBeTruthy();
  });

  test("straight, black 2", () => {
    let cards = [
      { rank: "2", suit: "C" },
      { rank: "J", suit: "H" },
      { rank: "Q", suit: "H" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(validator(cards)).toBeTruthy();
  });

  test("straight, red 2", () => {
    let cards = [
      { rank: "2", suit: "D" },
      { rank: "J", suit: "H" },
      { rank: "Q", suit: "H" },
      { rank: "K", suit: "H" },
      { rank: "A", suit: "H" },
    ];
    expect(validator(cards)).toBeFalsy();
  });

  it("should return false if there's less than 3 cards", () => {
    let cards = [
      { rank: "2", suit: "C" },
      { rank: "2", suit: "S" },
    ];
    expect(validator(cards)).toBeFalsy();
  });
});
