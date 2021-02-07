import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function PlayerDisplay(props) {
  let player = props.player;
  return (
    <>
      <Row className="display-player">
        <Col>{player.username}</Col>
        <Col xs lg="3" className={props.displayScore ? "" : "hide-score"}>
          {player.score}
        </Col>
      </Row>
    </>
  );
}

export default PlayerDisplay;
