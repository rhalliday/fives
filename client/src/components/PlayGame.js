import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Players from "./Players";
import Hand from "./Hand";
import Deck from "./Deck";
import Table from "./Table";
import { validator, score } from "../service/fives";
import { socket } from "../service/socket";
import { ROUND_RULES } from "../Constants";

class PlayGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      cards: [],
      table: [],
      canStartGame: false,
      currentPlayer: "",
      hasSelectedCard: false,
      currentRound: 0,
      canLay: false,
      hasGoneDown: false,
      discards: [],
    };
    this.HandleStartGame = this.HandleStartGame.bind(this);
    this.HandleMoveCard = this.HandleMoveCard.bind(this);
    this.HandleDeckClick = this.HandleDeckClick.bind(this);
    this.HandleDiscardClick = this.HandleDiscardClick.bind(this);
    this.HandleCardDiscard = this.HandleCardDiscard.bind(this);
    this.HandleClickedCard = this.HandleClickedCard.bind(this);
    this.HandleCardLay = this.HandleCardLay.bind(this);
  }

  componentDidMount() {
    socket.on("setPlayers", (gamePlayers) => {
      let canStartGame = gamePlayers[0].username === this.props.username;
      this.setState({
        players: gamePlayers,
        canStartGame: canStartGame,
      });
    });

    socket.on("dealtCards", (data) => {
      this.setState({
        cards: data.cards,
        discards: data.discards,
        canLay: false,
        currentRound: data.currentRound,
      });
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

    socket.on("getScore", () => {
      socket.emit("setScore", {
        username: this.props.username,
        score: score(this.state.cards),
      });
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
    this.setState({
      cards: cards,
      discards: discards,
      hasSelectedCard: false,
      canLay: true,
      hasGoneDown: !!this.state.table.length,
    });
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
  HandleCardLay() {
    let cardGroup = this.selectedCards();
    let currentTable = this.state.table;
    currentTable.push(cardGroup);
    let cards = this.state.cards.filter((card) => !card.selected);
    this.setState({ table: currentTable, cards: cards });
    socket.emit("setTable", {
      username: this.props.username,
      table: currentTable,
    });
  }
  selectedCards() {
    return this.state.cards.filter((card) => card.selected);
  }
  buttonsEnabled() {
    return (
      this.state.currentPlayer === this.props.username &&
      this.state.hasSelectedCard
    );
  }
  discardButtonDisabled() {
    return !(
      this.buttonsEnabled() &&
      this.selectedCards().length === 1 &&
      this.hasValidTable()
    );
  }
  layButtonDisabled() {
    return !(
      this.buttonsEnabled() &&
      this.state.canLay &&
      this.hasValidGroup()
    );
  }
  hasValidTable() {
    // if we've already gone down, or our table is empty then it's valid
    if (this.state.hasGoneDown || this.state.table.length === 0) {
      return true;
    }
    // valid group will make sure that we've only put groups down of the
    // correct length, so we just need to make sure they're the right number
    return this.state.table.length === ROUND_RULES[this.state.currentRound][0];
  }
  hasValidGroup() {
    let cardGroup = this.selectedCards();
    // simplest check is that we have 3 or more cards in the group
    if (cardGroup.length < 3) return false;

    // if we're going down this round
    if (!this.state.hasGoneDown) {
      // make sure the group is the correct size
      if (cardGroup.length !== ROUND_RULES[this.state.currentRound][1]) {
        return false;
      }
      // make sure we're not forming too many groups
      if (this.state.table.length >= ROUND_RULES[this.state.currentRound][0]) {
        return false;
      }
    }
    // return whether this is a valid group
    return validator(cardGroup);
  }
  render() {
    return (
      <>
        <Container>
          <h4>{ROUND_RULES[this.state.currentRound][2]}</h4>
        </Container>
        <Container>
          <Row>
            <Col>
              <Row>
                <Deck
                  discards={this.state.discards}
                  handleDeckClick={this.HandleDeckClick}
                  handleDiscardClick={this.HandleDiscardClick}
                />
              </Row>
            </Col>
            <Col>
              <Row>
                <Button
                  variant="primary"
                  disabled={this.discardButtonDisabled()}
                  onClick={this.HandleCardDiscard}
                >
                  Discard
                </Button>
              </Row>
              <Row>
                <Button
                  variant="primary"
                  disabled={this.layButtonDisabled()}
                  onClick={this.HandleCardLay}
                >
                  Lay Cards
                </Button>
              </Row>
            </Col>
            <Col>
              <Players
                players={this.state.players}
                currentPlayer={this.state.currentPlayer}
              />
            </Col>
          </Row>
        </Container>
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
        <Container>
          <Row>
            <Container>
              <Row id="player-table">
                <Table cards={this.state.table} />
              </Row>
            </Container>

            <Row id="player-hand">
              <Hand
                cards={this.state.cards}
                handleMoveCard={this.HandleMoveCard}
                handleClickedCard={this.HandleClickedCard}
              />
            </Row>
          </Row>
        </Container>
      </>
    );
  }
}

export default PlayGame;
