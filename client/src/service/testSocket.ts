type SocketMessage = {
  nsp: string;
  data: any;
};

export default class TestSocket {
  registeredCallbacks: Map<string, Function>;
  socketMessages: SocketMessage[];

  constructor() {
    this.registeredCallbacks = new Map();
    this.socketMessages = [];
  }

  on(nsp: string, cb: Function) {
    this.registeredCallbacks.set(nsp, cb);
  }

  emit(nsp: string, data: any) {
    this.socketMessages.push({ nsp: nsp, data: data });
  }

  triggerEvent(nsp: string, data: any) {
    const cb = this.registeredCallbacks.get(nsp);
    if (cb) {
      cb(data);
    }
  }

  clearMessages() {
    this.socketMessages = [];
  }
}
