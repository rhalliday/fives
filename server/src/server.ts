import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Card from "./lib/card";
import * as origin from "./config/origin.json";
import Game from "./lib/game";

const http = createServer();
const io = new Server(http, {
  cors: {
    origin: "http://" + origin.server + ":" + origin.port,
    methods: ["GET", "POST"],
  },
});

const game: Game = new Game(io, "game");

io.on("connection", function (socket: Socket) {
  console.log("A user connected: " + socket.id);

  socket.on("setUsername", (username: string) =>
    game.addPlayer(username, socket)
  );
  socket.on("startGame", () => game.startGame());
  socket.on("nextRound", () => game.dealRound());
  socket.on("getDeckCard", () => socket.emit("setDeckCard", game.dealCard()));
  socket.on("setTable", (data: { username: string; table: Card[][] }) =>
    game.setTable(data.username, data.table)
  );
  socket.on("setHand", (data: { username: string; hand: Card[] }) =>
    game.setHand(data.username, data.hand)
  );
  socket.on("sendMessage", (message: string) => game.sendMessage(message));
  socket.on("setDiscards", (discards: Card[]) => game.setDiscards(discards));
  socket.on("finishRound", () => game.finishRound());
  socket.on("nextPlayer", () => game.nextPlayer());

  socket.on("disconnect", function () {});
});

http.listen(8080, function () {
  console.log("Server started!");
});
