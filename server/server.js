const server = require("express")();
const http = require("http").createServer(server);
const clientServer = process.env["CLIENT_SERVER"] || "localhost";
const clientPort = process.env["CLIENT_PORT"] || "3000";
const io = require("socket.io")(http, {
  cors: {
    origin: "http://" + clientServer + ":" + clientPort,
    methods: ["GET", "POST"],
  },
});

const Deck = require("./lib/deck");
const Player = require("./lib/player");

let players = [];
let deck;
let currentPlayer = 0;
let currentRound = 0;
let gameStarted = false;

function dealRound() {
  // TODO: increase the number of packs depending on the number of players
  deck = new Deck(2);
  deck.shuffle();
  let discard = deck.deal(1);
  let sockets = io.of("/").sockets;
  currentPlayer = currentRound % players.length;
  players.forEach((player) => {
    if (sockets.has(player.socketId)) {
      player.setHand(deck.deal(13));
      sockets.get(player.socketId).emit("dealtCards", {
        cards: player.hand,
        discards: discard,
        currentRound: currentRound,
      });
    } else {
      console.log("Could not find socket " + player.socketId);
    }
    // make sure the players details have been reset
    player.setTable([]);
  });
  io.sockets.emit("setPlayers", players);
  io.sockets.emit("setCurrentPlayer", players[currentPlayer].username);
  currentRound++;
}

function findPlayerByUsername(username) {
  return players.find((player) => player.username === username);
}

io.on("connection", function (socket) {
  console.log("A user connected: " + socket.id);
  socket.on("setUsername", function (data) {
    let existingPlayer = findPlayerByUsername(data);
    if (existingPlayer) {
      if (gameStarted) {
        existingPlayer.setSocket(socket.id);
      } else {
        socket.emit(
          "userExists",
          data + " username is taken! Try some other username."
        );
        return;
      }
    } else {
      if (gameStarted) return;
      existingPlayer = new Player(socket.id, data);
      players.push(existingPlayer);
    }
    socket.emit("userSet", existingPlayer.username);
    socket.emit("setUserData", existingPlayer);
    io.sockets.emit("setPlayers", players);
  });

  socket.on("startGame", function () {
    // shuffle them players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    currentRound = 0;
    gameStarted = true;
    dealRound();
  });

  socket.on("nextRound", function () {
    dealRound();
  });

  socket.on("getDeckCard", function () {
    socket.emit("setDeckCard", deck.deal(1));
  });
  socket.on("setTable", function (data) {
    let player = findPlayerByUsername(data.username);
    player.setTable(data.table);
    io.sockets.emit("setPlayers", players);
  });
  socket.on("setHand", function (data) {
    let player = findPlayerByUsername(data.username);
    player.setHand(data.hand);
  });

  socket.on("setDiscards", function (discards) {
    io.sockets.emit("setDiscards", discards);
  });
  socket.on("setScore", function (data) {
    let player = findPlayerByUsername(data.username);
    player.addScore(data.score);
    io.sockets.emit("setPlayers", players);
  });
  socket.on("finishRound", function () {
    let losingPlayers = players.filter(
      (player) => player.socketId !== socket.id
    );
    let sockets = io.of("/").sockets;
    losingPlayers.forEach((player) => {
      sockets.get(player.socketId).emit("getScore");
    });
  });
  socket.on("nextPlayer", function () {
    currentPlayer = ++currentPlayer % players.length;
    if (players[currentPlayer].socketId === "") {
      players = players.filter((player) => player.socketId.length > 0);
      io.sockets.emit("setPlayers", players);
      currentPlayer = currentPlayer % players.length;
    }
    io.sockets.emit("setCurrentPlayer", players[currentPlayer].username);
  });
  socket.on("disconnect", function () {
    // allow the player to reconnect with the same username but a different socketId
    player = players.find((player) => player.socketId === socket.id);
    if (player) {
      console.log(
        "A user disconnected: " + player.username + "(" + player.socketId + ")"
      );
      player.clearSocket();
      io.sockets.emit("setPlayers", players);
    } else {
      console.log("unknown user left the game");
    }
  });
});

http.listen(8080, function () {
  console.log("Server started!");
});
