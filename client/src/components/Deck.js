import React from "react";

import Col from "react-bootstrap/Col";
import { getImageLocation } from "./Utils";
import Card from "./Card";

function Deck(props) {
  let arrayLen = props.discards.length;
  let getDiscardCard = () => {
    return arrayLen ? props.discards[arrayLen - 1] : {};
  };
  return (
    <>
      <Col>
        <div className="Card" onClick={props.handleDeckClick}>
          <img src={getImageLocation("back")} alt="card-back" />
        </div>
      </Col>
      <Col style={arrayLen ? {} : { display: "none" }}>
        <Card card={getDiscardCard()} onClick={props.handleDiscardClick} />
      </Col>
    </>
  );
}

export default Deck;
