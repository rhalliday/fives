const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const Deck = require("./lib/deck");

let players = [];
let deck;
let currentPlayer = 0;
let currentRound = 0;

function dealRound() {
  // TODO: increase the number of packs depending on the number of players
  deck = new Deck(2);
  deck.shuffle();
  let discard = deck.deal(1);
  let sockets = io.of("/").sockets;
  currentPlayer = currentRound % players.length;
  players.forEach((player) => {
    if (sockets.has(player.socketId)) {
      sockets.get(player.socketId).emit("dealtCards", {
        cards: deck.deal(13),
        discards: discard,
        currentRound: currentRound,
      });
    } else {
      console.log("Could not find socket " + player.socketId);
    }
    // make sure the players details have been reset
    player.table = [];
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

  players.push({ socketId: socket.id, username: "", table: [], score: 0 });
  socket.on("setUsername", function (data) {
    let existingPlayer = findPlayerByUsername(data);
    if (existingPlayer) {
      socket.emit(
        "userExists",
        data + " username is taken! Try some other username."
      );
    } else {
      let player = players.find((p) => p.socketId == socket.id);
      player.username = data;
      socket.emit("userSet", data);
      io.sockets.emit("setPlayers", players);
    }
  });

  socket.on("startGame", function () {
    // shuffle them players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    currentRound = 0;
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
    player.table = data.table;
    io.sockets.emit("setPlayers", players);
  });
  socket.on("setDiscards", function (discards) {
    io.sockets.emit("setDiscards", discards);
  });
  socket.on("setScore", function (data) {
    let player = findPlayerByUsername(data.username);
    player.score += data.score;
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
    io.sockets.emit("setCurrentPlayer", players[currentPlayer].username);
  });
  socket.on("updateUserTable", function (player) {
    let sockets = io.of("/").sockets;
    sockets.get(player.socketId).emit("updateTable", player.table);
  });
  socket.on("disconnect", function () {
    console.log("A user disconnected: " + socket.id);
    players = players.filter((player) => player.socketId !== socket.id);
    io.sockets.emit("setPlayers", players);
  });
});

http.listen(8080, function () {
  console.log("Server started!");
});
