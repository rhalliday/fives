/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { generatePlayer } from "../../service/testUtils";

/* Components */
import PlayerDisplay from "../PlayerDisplay";

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("PlayerDisplay", () => {
  const player = generatePlayer("bob");
  const clickHandler = () => {};
  const wrapper = shallow(
    <PlayerDisplay player={player} handleAddToGroup={clickHandler} />
  );
  const rows = wrapper.find("Fragment").children();
  const playerCols = rows.first().children();
  it("should have two rows", () => {
    expect(rows.length).toEqual(2);
  });
  it("should display a username", () => {
    expect(playerCols.first().text()).toEqual(player.username);
  });
  it("should display the score", () => {
    expect(playerCols.at(1).text()).toEqual(player.score + "");
  });
  it("should display the player table", () => {
    const table = rows.at(1).find("Table");
    expect(table).toBeDefined();
  });
});
