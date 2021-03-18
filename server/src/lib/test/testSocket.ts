type SocketMessage = {
  nsp: string;
  data: any;
};

export default class TestSocket {
  id: string;
  socketMessages: SocketMessage[];
  gameRoom: string;

  constructor(id: string) {
    this.id = id;
    this.clear();
  }

  emit(nsp: string, data: any) {
    this.socketMessages.push({ nsp: nsp, data: data });
  }

  join(gameRoom: string) {
    this.gameRoom = gameRoom;
  }

  clear() {
    this.socketMessages = [];
    this.gameRoom = "";
  }
}
