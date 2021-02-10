import React from "react";
//import { DndProvider } from "react-dnd";
//import { HTML5Backend } from "react-dnd-html5-backend";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Card from "./Card";

function Table(props) {
  let displayCards = (cards, groupIndex) => {
    return cards.map((card, index) => {
      return (
        <ListGroup.Item
          key={index}
          style={{ padding: "0", marginTop: card.selected ? "0" : "2em" }}
          onClick={() => props.groupClickHandler(groupIndex)}
        >
          <div className="Card-parent">
            <Card card={card} />
          </div>
        </ListGroup.Item>
      );
    });
  };
  let displayGroup = props.cards.map((cardGroup, index) => {
    return (
      <Col key={index}>
        <ListGroup horizontal style={{ marginTop: "2em" }}>
          {displayCards(cardGroup, index)}
        </ListGroup>
      </Col>
    );
  });
  return <>{displayGroup}</>;
}

export default Table;
