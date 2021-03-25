import { getImageLocation, getCardImageName } from "./Utils";

import { Card } from "../types/Card";

describe("getImageLocation tests", () => {
  it("should return an image location given a card string", () => {
    expect(getImageLocation("AS")).toEqual("/images/AS.svg");
  });
  it("should return an image location for the queen of hearts", () => {
    expect(getImageLocation("QH")).toEqual("/images/QH.svg");
  });
});

describe("getCardImageName returns an image name for a card", () => {
  it("should take a card and return a string representation of it", () => {
    const aceOfSpades: Card = { rank: "A", suit: "S", selected: false };
    expect(getCardImageName(aceOfSpades)).toEqual("AS");
  });
  it("should work for any card", () => {
    const aceOfSpades: Card = { rank: "6", suit: "C", selected: false };
    expect(getCardImageName(aceOfSpades)).toEqual("6C");
  });
});
