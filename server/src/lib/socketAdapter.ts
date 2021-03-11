export default class SocketAdaptor {
  gameRoomCallback: Function;
  updateSocketsCallback: Function;
  sendSingleCallback: Function;
  sockets: Map<String, any>;

  constructor(
    gameRoomCallback: Function,
    updateSocketsCallback: Function,
    sendSingleCallback: Function
  ) {
    this.gameRoomCallback = gameRoomCallback;
    this.updateSocketsCallback = updateSocketsCallback;
    this.sendSingleCallback = sendSingleCallback;
  }

  updateGameRoom(type: string, data: any) {
    this.gameRoomCallback(type, data);
  }

  updateSockets() {
    this.sockets = this.updateSocketsCallback();
  }

  sendSingle(key: string, type: string, data: any) {
    if (this.sockets.has(key)) {
      this.sendSingleCallback(this.sockets.get(key), type, data);
    } else {
      console.log("Could not find socket " + key);
    }
  }
}
