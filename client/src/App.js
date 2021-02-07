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
      username: "",
    };
    this.HandleSetUsername = this.HandleSetUsername.bind(this);
    this.HandleUpdateUsername = this.HandleUpdateUsername.bind(this);
  }
  componentDidMount() {
    socket.on("userSet", (data) => this.setState({ username: data }));
  }
  HandleUpdateUsername(username) {
    this.username = username;
  }
  HandleSetUsername() {
    socket.emit("setUsername", this.username);
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
          <PlayGame className="Game" username={this.state.username} />
        </Row>
      </Container>
    );
  }
}

export default App;
