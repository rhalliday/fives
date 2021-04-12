import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useMediaQuery } from "react-responsive";
import ListGroup from "react-bootstrap/ListGroup";
import DragableCard from "./DragableCard";
import { Card } from "../types/Card";

type handProps = {
  cards: Card[];
  handleClickedCard: Function;
  handleMoveCard: Function;
};

function Hand(props: handProps) {
  let displayCards = props.cards.map((card, index) => {
    /* istanbul ignore next */
    let clickedCard = () => props.handleClickedCard(index);
    return (
      <ListGroup.Item
        key={index}
        style={{ padding: "0", marginTop: card.selected ? "0" : "2em" }}
      >
        <DragableCard
          card={card}
          index={index}
          moveCard={props.handleMoveCard}
          clickCard={clickedCard}
        />
      </ListGroup.Item>
    );
  });
  const isTabletOrMobile = useMediaQuery({
    maxWidth: 991,
  });
  /* istanbul ignore next */
  return (
    <DndProvider backend={isTabletOrMobile ? TouchBackend : HTML5Backend}>
      <ListGroup horizontal style={{ marginTop: "2em" }}>
        {displayCards}
      </ListGroup>
    </DndProvider>
  );
}

export default Hand;
