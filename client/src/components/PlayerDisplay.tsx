import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "./Table";
import { Player } from "../types/Player";

type pdProps = {
  player: Player;
  handleAddToGroup: Function;
};

function PlayerDisplay(props: pdProps) {
  let player = props.player;
  /* istanbul ignore next */
  let clickHandler = (groupIndex: number) =>
    props.handleAddToGroup(groupIndex, player);
  return (
    <>
      <Row className="display-player">
        <Col>{player.username}</Col>
        <Col xs lg="3">
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
