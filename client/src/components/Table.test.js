/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

/* Components */
import Table from "./Table";

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("Table", () => {
  it("should render an empty tag if there aren't any cards", () => {
    const clickHandler = () => {};
    const wrapper = shallow(
      <Table cards={[]} groupClickHandler={clickHandler} />
    );
    const children = wrapper.children();
    expect(children.length).toEqual(0);
  });
  it("should render a single set of cards", () => {
    const clickHandler = () => {};
    const cards = generateCards([
      ["3", "C"],
      ["4", "C"],
      ["5", "C"],
    ]);
    const wrapper = shallow(
      <Table cards={[cards]} groupClickHandler={clickHandler} />
    );
    const col = wrapper.find("Fragment").children();
    expect(col.length).toEqual(1);
    const cardEls = col.find("ListGroup").children();
    expect(cardEls.length).toEqual(3);
  });
  it("should accept and apply a className", () => {
    const clickHandler = () => {};
    const cards = generateCards([
      ["3", "C"],
      ["4", "C"],
      ["5", "C"],
    ]);
    const wrapper = shallow(
      <Table
        cards={[cards]}
        groupClickHandler={clickHandler}
        className="testClass"
      />
    );
    const div = wrapper.find("div").first();
    expect(div.prop("className")).toContain("testClass");
  });
  it("should call a passed in function on click", () => {
    const cards = generateCards([
      ["3", "C"],
      ["4", "C"],
      ["5", "C"],
    ]);
    let clicked = false;
    const clickHandler = () => {
      clicked = true;
    };
    const wrapper = shallow(
      <Table
        cards={[cards]}
        groupClickHandler={clickHandler}
        className="testClass"
      />
    );
    const div = wrapper.find("ListGroupItem").first();
    div.simulate("click");
    expect(clicked).toBeTruthy();
  });
});

function generateCards(cardArray) {
  return cardArray.map((card) => generateCard(card[0], card[1]));
}

function generateCard(rank, suit) {
  return { rank: rank, suit: suit, selected: false };
}
