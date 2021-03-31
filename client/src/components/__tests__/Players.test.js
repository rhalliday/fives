/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { generatePlayer } from "../../service/testUtils";

/* Components */
import Players from "../Players";

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("Players", () => {
  it("should render a div and empty list group if there aren't any players", () => {
    const clickHandler = () => {};
    const wrapper = shallow(
      <Players players={[]} handleAddToGroup={clickHandler} currentPlayer="" />
    );
    const div = wrapper.find("div");
    const h4 = div.find("h4");
    expect(h4.text()).toEqual("Players");
    const children = div.find("ListGroup").children();
    expect(children.length).toEqual(0);
  });
  it("should display a single player", () => {
    const player = generatePlayer("bob");
    const clickHandler = () => {};
    const wrapper = shallow(
      <Players
        players={[player]}
        handleAddToGroup={clickHandler}
        currentPlayer=""
      />
    );
    const children = wrapper.find("ListGroup").children();
    expect(children.length).toEqual(1);
  });
  it("should display a multiple players", () => {
    const player = generatePlayer("bob");
    const player2 = generatePlayer("amb");
    const player3 = generatePlayer("imo");
    const player4 = generatePlayer("jen");
    const clickHandler = () => {};
    const wrapper = shallow(
      <Players
        players={[player, player2, player3, player4]}
        handleAddToGroup={clickHandler}
        currentPlayer=""
      />
    );
    const children = wrapper.find("ListGroup").children();
    expect(children.length).toEqual(4);
  });
  it("should highlight current player", () => {
    const player = generatePlayer("bob");
    const player2 = generatePlayer("amb");
    const player3 = generatePlayer("imo");
    const player4 = generatePlayer("jen");
    const clickHandler = () => {};
    const wrapper = shallow(
      <Players
        players={[player, player2, player3, player4]}
        handleAddToGroup={clickHandler}
        currentPlayer="bob"
      />
    );
    const expectedColours = ["#0f0"];
    wrapper
      .find("ListGroup")
      .children()
      .forEach((element) => {
        let colour = expectedColours.shift() || "";
        expect(element.get(0).props.style).toHaveProperty(
          "backgroundColor",
          colour
        );
      });
  });
});
