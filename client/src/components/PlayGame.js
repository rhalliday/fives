import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Players from "./Players";
import Cards from "./Cards";
import Deck from "./Deck";

function PlayGame(props) {
  return (
    <>
      <Col>
        <Row className="mb-2">
          <Col xs lg="8">
            <Row>
              <Deck
                discards={props.discards}
                handleDeckClick={props.handleDeckClick}
                handleDiscardClick={props.handleDiscardClick}
              />
            </Row>
          </Col>
          <Col>
            <Players players={props.players} />
          </Col>
        </Row>
        <Row
          id="start-game"
          style={
            props.canStartGame && props.cards.length === 0
              ? {}
              : { display: "none" }
          }
        >
          <Button
            variant="success"
            size="lg"
            className="StartButton"
            onClick={props.handleStartGame}
          >
            Start
          </Button>
        </Row>
        <Row>
          <Cards cards={props.cards} handleMoveCard={props.handleMoveCard} />
        </Row>
      </Col>
    </>
  );
}

export default PlayGame;
