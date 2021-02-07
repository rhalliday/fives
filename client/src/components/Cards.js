import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ListGroup from "react-bootstrap/ListGroup";
import DragableCard from "./DragableCard";

function Cards(props) {
  let displayCards = props.cards.map((card, index) => {
    return (
      <ListGroup.Item key={index} style={{ padding: "0" }}>
        <DragableCard
          card={card}
          index={index}
          moveCard={props.handleMoveCard}
        />
      </ListGroup.Item>
    );
  });
  return (
    <DndProvider backend={HTML5Backend}>
      <ListGroup horizontal style={{ marginTop: "2em" }}>
        {displayCards}
      </ListGroup>
    </DndProvider>
  );
}

export default Cards;
