import React from "react";
//import { DndProvider } from "react-dnd";
//import { HTML5Backend } from "react-dnd-html5-backend";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Card from "./Card";

import { Card as CardT } from "../types/Card";

type tableProps = {
  className?: string;
  groupClickHandler: Function;
  cards: CardT[][];
};

function Table(props: tableProps) {
  let className =
    "Card-parent" + (props.className ? " " + props.className : "");
  let displayCards = (cards: CardT[], groupIndex: number) => {
    return cards.map((card, index) => {
      return (
        <ListGroup.Item
          key={index}
          style={{ padding: "0" }}
          onClick={() => props.groupClickHandler(groupIndex)}
        >
          <div className={className}>
            <Card card={card} className={props.className} />
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
