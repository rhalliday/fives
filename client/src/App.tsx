import React from "react";
import Confetti from "react-confetti";

import "./App.css";
import DataEntry from "./components/DataEntry";
import PlayGame from "./components/PlayGame";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { socket } from "./service/socket";

class App extends React.Component<
  {},
  { username: string; message: string; finished: boolean }
> {
  username: string;
  constructor(props: any) {
    super(props);
    this.state = {
      username: "",
      message: "",
      finished: false,
    };
    this.username = "";
    this.HandleSetUsername = this.HandleSetUsername.bind(this);
    this.HandleUpdateUsername = this.HandleUpdateUsername.bind(this);
  }
  componentDidMount() {
    socket.on("userSet", (data: string) =>
      this.setState({ username: data, message: "" })
    );
    socket.on("userExists", (message: string) =>
      this.setState({ message: message })
    );
    socket.on("gameOver", () => this.setState({ finished: true }));
  }
  HandleUpdateUsername(username: string) {
    this.username = username.substring(0, 10);
  }
  HandleSetUsername() {
    socket.emit("setUsername", this.username);
  }
  render() {
    return (
      <Container>
        {this.state.finished && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <Row>
          <Col>
            <h1 className="page-header">Fives</h1>
          </Col>
        </Row>
        <Row>
          <div>{this.state.message}</div>
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
