import io from "socket.io-client";
import { ENDPOINT } from "../Constants";

export const socket: SocketIOClient.Socket = io(ENDPOINT);
