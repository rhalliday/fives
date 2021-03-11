import Rule from "./rule";
import Rules from "./rules";

test("new rules produce the right number of rules", () => {
  const rules = new Rules();
  expect(rules.rules.length).toEqual(6);
});

test("the rules are the correct rules", () => {
  let expectedRules = [
    new Rule(1, 3, "One Three"),
    new Rule(2, 3, "Two Three's"),
    new Rule(1, 4, "One Four"),
    new Rule(2, 4, "Two Four's"),
    new Rule(1, 5, "One Five"),
    new Rule(2, 5, "Two Five's"),
  ];
  const rules = new Rules();
  expect(rules.hasNext()).toBeTruthy();
  expectedRules.forEach((r) => expect(rules.next()).toEqual(r));
  expect(rules.hasNext()).toBeFalsy();
});
