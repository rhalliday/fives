/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

/* Components */
import Card from "./Card";

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("Card", () => {
  it("should render an img tag", () => {
    const card = generateCard("A", "S");
    const wrapper = shallow(<Card card={card} />);
    const image = wrapper.find("img");
    expect(image.prop("src")).toEqual("/images/AS.svg");
  });
  it("should accept and apply a className", () => {
    const card = generateCard("Q", "H");
    const wrapper = shallow(<Card card={card} className="testClass" />);
    const div = wrapper.find("div");
    expect(div.prop("className")).toContain("testClass");
  });
  it("should call a passed in function on click", () => {
    const card = generateCard("2", "C");
    let clicked = false;
    const clickHandle = () => {
      clicked = true;
    };
    const wrapper = shallow(<Card card={card} onClick={clickHandle} />);
    const div = wrapper.find("div");
    div.simulate("click");
    expect(clicked).toBeTruthy();
  });
});

function generateCard(rank, suit) {
  return { rank: rank, suit: suit, selected: false };
}
