/* Dependencies */
import { render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { generateCard } from "../../service/testUtils";

/* Components */
import DragableCard from "../DragableCard";

describe("DraggableCard", () => {
  const card = generateCard("A", "S");
  const moveCard = () => {};
  const clickCard = () => {};
  const wrapper = render(
    <DndProvider backend={HTML5Backend}>
      <DragableCard
        index={0}
        moveCard={moveCard}
        clickCard={clickCard}
        card={card}
      />
    </DndProvider>
  );
  const cardDiv = wrapper.getByTestId("draggable-card-0");
  it("should render a card wrapped in a div", () => {
    const img = screen.getAllByAltText("AS");
    expect(img).toBeDefined();
    expect(cardDiv).toHaveProperty("draggable");
  });
});
