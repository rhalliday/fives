import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Players from "./Players";
import Cards from "./Cards";
import Deck from "./Deck";
import { socket } from "../service/socket";

class PlayGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      cards: [],
      canStartGame: false,
      currentPlayer: "",
      hasSelectedCard: false,
      currentRound: 0,
      discards: [],
    };
    this.HandleStartGame = this.HandleStartGame.bind(this);
    this.HandleMoveCard = this.HandleMoveCard.bind(this);
    this.HandleDeckClick = this.HandleDeckClick.bind(this);
    this.HandleDiscardClick = this.HandleDiscardClick.bind(this);
    this.HandleCardDiscard = this.HandleCardDiscard.bind(this);
    this.HandleClickedCard = this.HandleClickedCard.bind(this);
  }

  componentDidMount() {
    socket.on("setPlayers", (gamePlayers) => {
      let canStartGame = gamePlayers[0].username === this.props.username;
      this.setState({
        players: gamePlayers,
        canStartGame: canStartGame,
      });
    });

    socket.on("dealtCards", (cards) => {
      this.setState({ cards: cards[0], discards: cards[1] });
    });

    socket.on("setDeckCard", (card) => {
      let cards = this.state.cards;
      cards.push(card[0]);
      this.setState({ cards: cards });
    });

    socket.on("setDiscards", (discards) => {
      this.setState({ discards: discards });
    });

    socket.on("setCurrentPlayer", (currentPlayer) => {
      this.setState({ currentPlayer: currentPlayer });
    });
  }
  canClickCard() {
    return (
      this.state.currentPlayer === this.props.username &&
      !this.state.hasSelectedCard
    );
  }
  HandleStartGame() {
    socket.emit("startGame");
  }
  HandleMoveCard(dragIndex, hoverIndex) {
    let cards = this.state.cards;
    const dragCard = cards.splice(dragIndex, 1);
    cards.splice(hoverIndex, 0, dragCard[0]);
    this.setState({ cards: cards });
  }
  HandleDeckClick() {
    if (!this.canClickCard()) return;
    this.setState({ hasSelectedCard: true });
    socket.emit("getDeckCard");
  }
  HandleDiscardClick() {
    if (!this.canClickCard()) return;
    let discards = this.state.discards;
    let cards = this.state.cards;
    cards.push(discards.pop());
    this.setState({ cards: cards, discards: discards, hasSelectedCard: true });
    socket.emit("setDiscards", discards);
  }
  HandleClickedCard(cardIndex) {
    let cards = this.state.cards;
    cards[cardIndex].selected = !cards[cardIndex].selected;
    this.setState({ cards: cards });
  }
  HandleCardDiscard() {
    let cards = this.state.cards;
    let discards = this.state.discards;
    let discardIndex = cards.findIndex((card) => card.selected);
    cards[discardIndex].selected = false;
    discards.push(cards[discardIndex]);
    cards.splice(discardIndex, 1);
    this.setState({ cards: cards, discards: discards, hasSelectedCard: false });
    socket.emit("setDiscards", discards);
    this.HandleTurnEnd();
  }
  HandleTurnEnd() {
    if (this.state.cards.length === 0) {
      socket.emit("finishRound");
    } else {
      socket.emit("nextPlayer");
    }
  }
  render() {
    let selectedCards = this.state.cards.filter((card) => card.selected);
    let buttonsDisabled = !(
      this.state.currentPlayer === this.props.username &&
      this.state.hasSelectedCard
    );
    return (
      <>
        <Col>
          <Row className="mb-2">
            <Col xs lg="8">
              <Row>
                <Deck
                  discards={this.state.discards}
                  handleDeckClick={this.HandleDeckClick}
                  handleDiscardClick={this.HandleDiscardClick}
                />
              </Row>
            </Col>
            <Col>
              <Button
                variant="primary"
                disabled={buttonsDisabled || selectedCards.length !== 1}
                onClick={this.HandleCardDiscard}
              >
                Discard
              </Button>
            </Col>
            <Col>
              <Players
                players={this.state.players}
                currentPlayer={this.state.currentPlayer}
              />
            </Col>
          </Row>
          <Row
            id="start-game"
            style={
              this.state.canStartGame && this.state.cards.length === 0
                ? {}
                : { display: "none" }
            }
          >
            <Button
              variant="success"
              size="lg"
              className="StartButton"
              onClick={this.HandleStartGame}
            >
              Start
            </Button>
          </Row>
          <Row>
            <Cards
              cards={this.state.cards}
              handleMoveCard={this.HandleMoveCard}
              handleClickedCard={this.HandleClickedCard}
            />
          </Row>
        </Col>
      </>
    );
  }
}

export default PlayGame;
