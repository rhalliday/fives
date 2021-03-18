import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Players from "./Players";
import Hand from "./Hand";
import Deck from "./Deck";
import { validator } from "../service/fives";
import { socket } from "../service/socket";
import { Player } from "../types/Player";
import { Card } from "../types/Card";
import { Round } from "../types/Round";

type gameProps = {
  className: string;
  username: string;
};

type gameState = {
  players: Player[];
  me: Player;
  currentPlayer: string;
  currentRound: Round;
  discards: Card[];
  message: string;
};

class PlayGame extends React.Component<gameProps, gameState> {
  constructor(props: gameProps) {
    super(props);
    const dummyPlayer: Player = {
      socketId: "",
      username: "",
      table: [],
      hand: [],
      score: 0,
      canStartGame: false,
      canGoDown: false,
      hasGoneDown: false,
      hasDrawn: false,
    };
    const dummyRound: Round = {
      numSets: 0,
      setSize: 0,
      title: "",
    };
    this.state = {
      players: [],
      currentPlayer: "",
      message: "Waiting for the game to start",
      discards: [],
      me: dummyPlayer,
      currentRound: dummyRound,
    };
    this.HandleStartGame = this.HandleStartGame.bind(this);
    this.HandleMoveCard = this.HandleMoveCard.bind(this);
    this.HandleDeckClick = this.HandleDeckClick.bind(this);
    this.HandleDiscardClick = this.HandleDiscardClick.bind(this);
    this.HandleCardDiscard = this.HandleCardDiscard.bind(this);
    this.HandleClickedCard = this.HandleClickedCard.bind(this);
    this.HandleCardLay = this.HandleCardLay.bind(this);
    this.HandleAddToTableGroup = this.HandleAddToTableGroup.bind(this);
    this.HandleAddToOtherTable = this.HandleAddToOtherTable.bind(this);
    this.HandleUndoCardLay = this.HandleUndoCardLay.bind(this);
  }

  componentDidMount() {
    socket.on("setPlayers", (gamePlayers: Player[]) => {
      const me = gamePlayers.find((p) => p.username === this.props.username);
      if (me) {
        this.setState({
          players: gamePlayers,
          me: me,
        });
      }
    });

    socket.on("setCurrentRound", (currentRound: Round) =>
      this.setState({ currentRound: currentRound })
    );

    socket.on("setDiscards", (discards: Card[]) =>
      this.setState({ discards: discards })
    );

    socket.on("setCurrentPlayer", (currentPlayer: string) =>
      this.setState({ currentPlayer: currentPlayer })
    );
    socket.on("setMessage", (message: string) =>
      this.setState({ message: message })
    );
  }
  sendMessage(message: string) {
    socket.emit("sendMessage", message);
  }
  canClickCard() {
    return (
      this.state.currentPlayer === this.props.username &&
      !this.state.me.hasDrawn
    );
  }
  HandleStartGame() {
    socket.emit("startGame");
  }
  HandleMoveCard(dragIndex: number, hoverIndex: number) {
    let me = this.state.me;
    const dragCard = me.hand.splice(dragIndex, 1);
    me.hand.splice(hoverIndex, 0, dragCard[0]);
    this.setState({ me: me });
  }
  HandleDeckClick() {
    if (!this.canClickCard()) return;
    socket.emit("setHand", this.state.me.hand);
    socket.emit("getDeckCard");
    this.sendMessage("card selected from deck");
  }
  HandleDiscardClick() {
    if (!this.canClickCard()) return;
    socket.emit("setHand", this.state.me.hand);
    socket.emit("getDiscardCard");
    this.sendMessage("card selected from discard");
  }
  HandleClickedCard(cardIndex: number) {
    let me = this.state.me;
    me.hand[cardIndex].selected = !me.hand[cardIndex].selected;
    this.setState({ me: me });
  }
  HandleCardDiscard() {
    let hand = this.state.me.hand;
    let discardIndex = hand.findIndex((card) => card.selected);
    let discard = hand.splice(discardIndex, 1);
    discard[0].selected = false;
    socket.emit("setDiscard", { discard: discard[0], hand: hand });
  }
  HandleCardLay() {
    let cardGroup = this.selectedCards();
    let currentTable = this.state.me.table;
    currentTable.push(cardGroup);
    this.updateMyTable(currentTable);
  }
  HandleUndoCardLay() {
    // put the cards back in my hand
    let pickupCards = this.state.me.table.shift();
    if (pickupCards) {
      let tableCards = pickupCards.map((card) => {
        card.selected = false;
        return card;
      });
      let me = this.state.me;
      let cards = me.hand.concat(tableCards);
      me.hand = cards;
      me.table = [];
      this.setState({ me: me });
      this.sendTable([], cards);
    }
  }
  sendTable(table: Card[][], hand: Card[], username?: string) {
    username = username || this.props.username;
    socket.emit("setHand", hand);
    socket.emit("setTable", {
      username: username,
      table: table,
    });
  }
  updateMyTable(currentTable: Card[][]) {
    let me = this.state.me;
    let cards = me.hand.filter((card) => !card.selected);
    me.hand = cards;
    me.table = currentTable;
    this.setState({ me: me });
    this.sendTable(currentTable, cards);
  }
  HandleAddToTableGroup(groupIndex: number) {
    if (this.state.me.hand.length < 2) return;
    let cardGroup = this.selectedCards();
    let table = this.state.me.table;
    let selectedGroup = table[groupIndex];
    let newTableGroup = this.addToGroup(cardGroup, selectedGroup);
    // if we didn't make a valid group then we can't lay them
    if (newTableGroup.length > 0) {
      table[groupIndex] = newTableGroup;
      this.updateMyTable(table);
    }
  }
  HandleAddToOtherTable(groupIndex: number, otherPlayer: Player) {
    if (this.state.me.hand.length < 2) return;
    let cardGroup = this.selectedCards();
    let table = otherPlayer.table;
    let selectedGroup = table[groupIndex];
    let newTableGroup = this.addToGroup(cardGroup, selectedGroup);
    if (newTableGroup.length > 0) {
      table[groupIndex] = newTableGroup;
      let me = this.state.me;
      let cards = me.hand.filter((card) => !card.selected);
      me.hand = cards;
      this.setState({ me: me });
      this.sendTable(table, cards, otherPlayer.username);
    }
  }
  addToGroup(cardGroup: Card[], selectedGroup: Card[]) {
    // if we havn't gone down yet, we can't lay cards
    if (!this.state.me.hasGoneDown) {
      return [];
    }
    // check to see if adding the cards to the front of the group is valid
    let newGroup = cardGroup.concat(selectedGroup);
    if (validator(newGroup)) {
      return newGroup;
    }
    // try adding them to the end
    newGroup = selectedGroup.concat(cardGroup);
    if (validator(newGroup)) {
      return newGroup;
    }

    // it's not valid
    return [];
  }
  selectedCards() {
    return this.state.me.hand.filter((card) => card.selected);
  }
  buttonsEnabled() {
    return (
      this.state.currentPlayer === this.props.username && this.state.me.hasDrawn
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
      this.state.me.canGoDown &&
      this.state.me.hand.length > 3 &&
      this.hasValidGroup()
    );
  }
  showUndoButton() {
    return (
      this.state.currentRound.numSets === 2 && this.state.me.table.length === 1
    );
  }
  hasValidTable() {
    // if we've already gone down, or our table is empty then it's valid
    if (this.state.me.hasGoneDown || this.state.me.table.length === 0) {
      return true;
    }
    // valid group will make sure that we've only put groups down of the
    // correct length, so we just need to make sure they're the right number
    return this.state.me.table.length === this.state.currentRound.numSets;
  }
  hasValidGroup() {
    let cardGroup = this.selectedCards();
    // simplest check is that we have 3 or more cards in the group
    if (cardGroup.length < 3) return false;

    // if we're going down this round
    if (!this.state.me.hasGoneDown) {
      // make sure the group is the correct size
      if (cardGroup.length !== this.state.currentRound.setSize) {
        return false;
      }
      // make sure we're not forming too many groups
      if (this.state.me.table.length >= this.state.currentRound.numSets) {
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
          <h4>{this.state.currentRound.title}</h4>
          <div>{this.state.message}</div>
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
              <Container>
                <Row id="player-hand">
                  <Hand
                    cards={this.state.me.hand}
                    handleMoveCard={this.HandleMoveCard}
                    handleClickedCard={this.HandleClickedCard}
                  />
                </Row>
              </Container>
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
              <Row>
                <Button
                  variant="primary"
                  onClick={this.HandleUndoCardLay}
                  style={this.showUndoButton() ? {} : { display: "none" }}
                >
                  Undo
                </Button>
              </Row>
            </Col>
            <Col>
              <Players
                players={this.state.players}
                currentPlayer={this.state.currentPlayer}
                handleAddToGroup={this.HandleAddToOtherTable}
              />
            </Col>
          </Row>
        </Container>
        <Row
          id="start-game"
          style={this.state.me.canStartGame ? {} : { display: "none" }}
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
      </>
    );
  }
}

export default PlayGame;
