/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { generateCards } from "../../service/testUtils";

/* Components */
import Hand from "../Hand";

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("Hand", () => {
  const handleClickedCard = () => {};
  const handleMoveCard = () => {};
  it("should render an empty list group if there are no cards", () => {
    const wrapper = shallow(
      <Hand
        cards={[]}
        handleClickedCard={handleClickedCard}
        handleMoveCard={handleMoveCard}
      />
    );
    const listItems = wrapper.find("ListGroup").children();
    expect(listItems.length).toEqual(0);
  });
  it("should render a list group with draggable cards", () => {
    const cards = generateCards([
      ["A", "S"],
      ["7", "D"],
      ["5", "H"],
      ["9", "C"],
    ]);
    const wrapper = shallow(
      <Hand
        cards={cards}
        handleClickedCard={handleClickedCard}
        handleMoveCard={handleMoveCard}
      />
    );
    const listItems = wrapper.find("ListGroup").children();
    expect(listItems.length).toEqual(cards.length);
  });
});
