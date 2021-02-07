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

io.on("connection", function (socket) {
  console.log("A user connected: " + socket.id);

  players.push({ socketId: socket.id });
  socket.on("setUsername", function (data) {
    let existingPlayer = players.filter((player) => player.username === data);
    if (existingPlayer.length > 0) {
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
    // TODO: increase the number of packs depending on the number of players
    deck = new Deck(2);
    deck.shuffle();
    let discard = deck.deal(1);
    let sockets = io.of("/").sockets;
    // shuffle them players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    players.forEach((player) => {
      if (sockets.has(player.socketId)) {
        sockets
          .get(player.socketId)
          .emit("dealtCards", [deck.deal(13), discard]);
      } else {
        console.log("Could not find socket " + player.socketId);
      }
    });
    io.sockets.emit("setPlayers", players);
    io.sockets.emit("setCurrentPlayer", players[0].username);
  });

  socket.on("getDeckCard", function () {
    socket.emit("setDeckCard", deck.deal(1));
  });

  socket.on("setDiscards", function (discards) {
    io.sockets.emit("setDiscards", discards);
  });

  socket.on("finishRound", function () {
    console.log("finishRound not implemented");
  });
  socket.on("nextPlayer", function () {
    currentPlayer = (currentPlayer + 1) % players.length;
    io.sockets.emit("setCurrentPlayer", players[currentPlayer].username);
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
