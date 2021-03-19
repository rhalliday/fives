import Rule from "./rule";

test("Can create a rule", () => {
  const title = "One Three";
  const rule = new Rule(1, 3, title);
  expect(rule.title).toEqual(title);
  expect(rule.numSets).toEqual(1);
  expect(rule.setSize).toEqual(3);
});
