import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "./Table";

function PlayerDisplay(props) {
  let player = props.player;
  let clickHandler = (groupIndex) => props.handleAddToGroup(groupIndex, player);
  return (
    <>
      <Row className="display-player">
        <Col>{player.username}</Col>
        <Col xs lg="3" className={props.displayScore ? "" : "hide-score"}>
          {player.score}
        </Col>
      </Row>
      <Row>
        <Table
          cards={player.table}
          groupClickHandler={clickHandler}
          className="small"
        />
      </Row>
    </>
  );
}

export default PlayerDisplay;
