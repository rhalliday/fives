import Deck from "./deck";

test("generateDeck returns a deck of 52 cards", () => {
  let deck = new Deck(1);
  expect(deck.generatePack().length).toBe(52);
});

test("with 1 pack, creates a deck of 52 cards", () => {
  let deck = new Deck(1);
  deck.shuffle();
  expect(deck.deck.length).toBe(52);
});

test("with 4 packs, creates a deck of 208 cards", () => {
  let deck = new Deck(4);
  expect(deck.deck.length).toBe(208);
});

test("shuffle reorders the deck", () => {
  let deck = new Deck(1);
  deck.shuffle();
  let ordered = deck.generatePack();
  expect(deck.deck).not.toEqual(ordered);
});

test("can deal 1 card", () => {
  let deck = new Deck(1);
  let cards = deck.deal(1);
  expect(cards[0]).toEqual({ rank: "A", suit: "H" });
  expect(cards.length).toBe(1);
  expect(deck.deck.length).toBe(51);
});

test("can deal 13 cards", () => {
  let deck = new Deck(1);
  let cards = deck.deal(13);
  expect(cards.length).toBe(13);
  expect(cards[0]).toEqual({ rank: "A", suit: "H" });
  expect(cards[12]).toEqual({ rank: "4", suit: "H" });
  expect(deck.deck.length).toBe(39);
});

test("dealing too many cards", () => {
  let deck = new Deck(1);
  expect(() => deck.deal(53)).toThrow("Not enough cards");
});
