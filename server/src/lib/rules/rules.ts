import Rule from "./rule";

export default class Rules {
  rules: Rule[];
  currentRule: number;

  constructor() {
    this.currentRule = 0;
    this.rules = [
      new Rule(1, 3, "One Three"),
      new Rule(2, 3, "Two Three's"),
      new Rule(1, 4, "One Four"),
      new Rule(2, 4, "Two Four's"),
      new Rule(1, 5, "One Five"),
      new Rule(2, 5, "Two Five's"),
    ];
  }

  hasNext() {
    return this.currentRule + 1 <= this.rules.length;
  }

  next() {
    return this.rules[this.currentRule++];
  }
}
