export const ItemTypes = {
  CARD: "card",
};

const server = "localhost";
const port = "8080";

export const ENDPOINT = "http://" + server + ":" + port;

export const ROUND_RULES = [
  [1, 3, "One Three"],
  [2, 3, "Two Three's"],
  [1, 4, "One Four"],
  [2, 4, "Two Four's"],
  [1, 5, "One Five"],
  [2, 5, "Two Five's"],
];

export const TIME_TO_SHUFFLE = 10000;
