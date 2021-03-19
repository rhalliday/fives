type roomUpdateType = { nsp: string; data: any };

export default class GameRoomUpdater {
  roomUpdates: roomUpdateType[];

  constructor() {
    this.roomUpdates = [];
  }

  getRoomUpdateFunction() {
    return (nsp: string, data: any) =>
      this.roomUpdates.push({ nsp: nsp, data: data });
  }

  getRoomUpdate() {
    return this.roomUpdates.shift();
  }
  clearRoomUpdate() {
    this.roomUpdates = [];
  }
}
