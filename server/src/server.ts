import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Card from "./lib/cards/card";
import * as origin from "./config/origin.json";
import Game from "./lib/game";
import SocketAdaptor from "./lib/socketAdapter";

const http = createServer();
const io = new Server(http, {
  cors: {
    origin: "http://" + origin.server + ":" + origin.port,
    methods: ["GET", "POST"],
  },
});

const gameRoom = "game";

const socketAdapter = new SocketAdaptor(
  (type: string, data: any) => io.in(gameRoom).emit(type, data),
  () => io.of("/").sockets,
  (socket: Socket, type: string, data: any) => socket.emit(type, data)
);

const game: Game = new Game(socketAdapter);

io.on("connection", function (socket: Socket) {
  console.log("A user connected: " + socket.id);

  socket.on("setUsername", (username: string) =>
    game.addPlayer(username, socket, gameRoom)
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
