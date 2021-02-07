import React from "react";

import "./App.css";
import DataEntry from "./components/DataEntry";
import PlayGame from "./components/PlayGame";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { socket } from "./service/socket";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      username: "",
      cards: [],
      canStartGame: false,
      currentPlayer: "",
      hasSelectedCard: false,
      currentRound: 0,
      discards: [],
    };
    this.HandleSetUsername = this.HandleSetUsername.bind(this);
    this.HandleUpdateUsername = this.HandleUpdateUsername.bind(this);
    this.HandleStartGame = this.HandleStartGame.bind(this);
    this.HandleMoveCard = this.HandleMoveCard.bind(this);
    this.HandleDeckClick = this.HandleDeckClick.bind(this);
    this.HandleDiscardClick = this.HandleDiscardClick.bind(this);
    this.HandleCardDiscard = this.HandleCardDiscard.bind(this);
    this.HandleClickedCard = this.HandleClickedCard.bind(this);
  }

  componentDidMount() {
    socket.on("userSet", (data) => this.setState({ username: data }));

    socket.on("setPlayers", (data) => {
      let gamePlayers = data.filter((player) => player.username);
      let canStartGame = gamePlayers[0].username === this.state.username;
      this.setState({
        players: gamePlayers,
        canStartGame: canStartGame,
        currentPlayer: gamePlayers[0].username,
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
      this.state.currentPlayer === this.state.username &&
      !this.state.hasSelectedCard
    );
  }
  HandleUpdateUsername(username) {
    this.username = username;
  }
  HandleSetUsername() {
    socket.emit("setUsername", this.username);
  }
  HandleStartGame() {
    let players = this.state.players;
    // shuffle them players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    socket.emit("startGame", players);
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
    console.log("inside handle turn end");
    if (this.state.cards.length === 0) {
      socket.emit("finishRound");
    } else {
      console.log("picking next player");
      socket.emit("nextPlayer");
    }
  }
  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h1 className="page-header">Fives</h1>
          </Col>
        </Row>
        <Row
          id="data-entry"
          style={this.state.username ? { display: "none" } : {}}
        >
          <DataEntry
            className="Opener"
            handleUpdateUsername={this.HandleUpdateUsername}
            handleSetUsername={this.HandleSetUsername}
          />
        </Row>
        <Row
          id="game-board"
          style={this.state.username ? {} : { display: "none" }}
        >
          <PlayGame
            className="Game"
            players={this.state.players}
            username={this.state.username}
            currentPlayer={this.state.currentPlayer}
            handleStartGame={this.HandleStartGame}
            canStartGame={this.state.canStartGame}
            cards={this.state.cards}
            discards={this.state.discards}
            handleMoveCard={this.HandleMoveCard}
            handleDeckClick={this.HandleDeckClick}
            handleDiscardClick={this.HandleDiscardClick}
            handleClickedCard={this.HandleClickedCard}
            handleCardDiscard={this.HandleCardDiscard}
            hasSelectedCard={this.state.hasSelectedCard}
          />
        </Row>
      </Container>
    );
  }
}

export default App;
