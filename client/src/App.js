import React from "react";
import socketIOClient from "socket.io-client";

import "./App.css";
import DataEntry from "./components/DataEntry";
import PlayGame from "./components/PlayGame";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const ENDPOINT = "http://localhost:8080";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      username: "",
      socket: socketIOClient(ENDPOINT),
      cards: [],
      canStartGame: false,
      currentPlayer: "",
      hasSelectedCard: false,
      currentRound: 0,
      discards: [],
    };

    this.state.socket.on("userSet", (data) =>
      this.setState({ username: data })
    );

    this.state.socket.on("setPlayers", (data) => {
      let gamePlayers = data.filter((player) => player.username);
      let canStartGame = gamePlayers[0].username === this.state.username;
      this.setState({
        players: gamePlayers,
        canStartGame: canStartGame,
        currentPlayer: gamePlayers[0].username,
      });
    });

    this.state.socket.on("dealtCards", (cards) => {
      console.log(cards);
      this.setState({ cards: cards[0], discards: cards[1] });
    });

    this.state.socket.on("setDeckCard", (card) => {
      let cards = this.state.cards;
      cards.push(card[0]);
      this.setState({ cards: cards });
    });

    this.state.socket.on("setDiscards", (discards) => {
      console.log(discards);
      this.setState({ discards: discards });
    });

    this.HandleSetUsername = this.HandleSetUsername.bind(this);
    this.HandleUpdateUsername = this.HandleUpdateUsername.bind(this);
    this.HandleStartGame = this.HandleStartGame.bind(this);
    this.HandleMoveCard = this.HandleMoveCard.bind(this);
    this.HandleDeckClick = this.HandleDeckClick.bind(this);
    this.HandleDiscardClick = this.HandleDiscardClick.bind(this);
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
    this.state.socket.emit("setUsername", this.username);
  }
  HandleStartGame() {
    let players = this.state.players;
    // shuffle them players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    this.state.socket.emit("startGame", players);
  }
  HandleMoveCard(dragIndex, hoverIndex) {
    let cards = this.state.cards;
    const dragCard = cards.splice(dragIndex, 1);
    cards.splice(hoverIndex, 0, dragCard[0]);
    this.setState({ cards: cards });
  }
  HandleDeckClick() {
    if (!this.canClickCard()) return;
    this.state.socket.emit("getDeckCard");
    this.setState({ hasSelectedCard: true });
  }
  HandleDiscardClick() {
    if (!this.canClickCard()) return;
    let discards = this.state.discards;
    let cards = this.state.cards;
    cards.push(discards.pop());
    this.setState({ cards: cards, discards: discards, hasSelectedCard: true });
    this.state.socket.emit("setDiscards", discards);
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
            players={this.state.players}
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
            handleStartGame={this.HandleStartGame}
            canStartGame={this.state.canStartGame}
            cards={this.state.cards}
            discards={this.state.discards}
            handleMoveCard={this.HandleMoveCard}
            handleDeckClick={this.HandleDeckClick}
            handleDiscardClick={this.HandleDiscardClick}
          />
        </Row>
      </Container>
    );
  }
}

export default App;
