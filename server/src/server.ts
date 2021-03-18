import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Card from "./lib/cards/card";
import * as origin from "./config/origin.json";
import Game from "./lib/game";

const http = createServer();
const server = "http://" + origin.server + ":" + origin.port;
console.log(server);
const io = new Server(http, {
  cors: {
    origin: server,
    methods: ["GET", "POST"],
  },
});

const gameRoom = "game";

const updateGameRoom = (type: string, data: any) =>
  io.in(gameRoom).emit(type, data);

const game: Game = new Game(updateGameRoom);

function checkCurrentPlayer(socket: Socket, callback: Function) {
  if (game.isCurrentPlayer(socket.id)) {
    callback();
  }
}

io.on("connection", function (socket: Socket) {
  const playerCheck = (callback: Function) =>
    checkCurrentPlayer(socket, callback);
  console.log("A user connected: " + socket.id);

  socket.on("setUsername", (username: string) =>
    game.addPlayer(username, socket, gameRoom)
  );
  socket.on("startGame", () => game.startGame());
  socket.on("getDeckCard", () => playerCheck(() => game.drawFromDeck()));
  socket.on("getDiscardCard", () => playerCheck(() => game.drawFromDiscard()));
  socket.on("setTable", (data: { username: string; table: Card[][] }) => {
    playerCheck(() => game.setTable(data.username, data.table));
  });
  socket.on("setHand", (hand: Card[]) => playerCheck(() => game.setHand(hand)));
  socket.on("setDiscard", (data: { discard: Card; hand: Card[] }) => {
    playerCheck(() => game.discard(data.discard, data.hand));
  });
  socket.on("sendMessage", (message: string) => game.sendMessage(message));
  socket.on("disconnect", () => game.disconnectPlayer(socket.id));
});

http.listen(8080, function () {
  console.log("Server started!");
});
