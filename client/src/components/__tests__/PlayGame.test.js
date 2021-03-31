/* Dependencies */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {
  generatePlayer,
  generateCards,
  generateCard,
} from "../../service/testUtils";
import { socket } from "../../service/socket";

/* Components */
import PlayGame from "../PlayGame";

jest.mock("../../service/socket");

// Configure enzyme for react 16
Enzyme.configure({ adapter: new Adapter() });

describe("PlayGame", () => {
  const player = generatePlayer("bob");
  const players = [
    player,
    generatePlayer("imo"),
    generatePlayer("amb"),
    generatePlayer("jen"),
  ];
  const game = shallow(
    <PlayGame className="testGame" username={player.username} />
  );
  const instance = game.instance();
  it("should register all message handlers", () => {
    const expectedHandlers = [
      "setPlayers",
      "setCurrentRound",
      "setDiscards",
      "setCurrentPlayer",
      "setMessage",
    ];
    expectedHandlers.forEach((nsp) =>
      expect(socket.registeredCallbacks.has(nsp)).toBeTruthy()
    );
    // for full coverage
    socket.triggerEvent("testTrigger", "nope");
  });
  it("should display a container with some data", () => {
    //console.log(game.debug());
    const children = game.find("Fragment").children();
    expect(children.length).toEqual(3);
    const div = game.find("Fragment").first().find("div");
    expect(div.text()).toEqual("Waiting for the game to start");
  });
  it("should update the message if the server sends one", () => {
    const message = "This is a test";
    socket.triggerEvent("setMessage", message);
    const div = game.find("Fragment").first().find("div");
    expect(div.text()).toEqual(message);
  });
  it("should update the title with the name of the current round", () => {
    const title = "One Three";
    socket.triggerEvent("setCurrentRound", {
      numSets: 1,
      setSize: 3,
      title: title,
    });
    const h4 = game.find("Fragment").first().find("h4");
    expect(h4.text()).toEqual(title);
  });
  it("should update the players and the currentPlayer when set players is called", () => {
    socket.triggerEvent("setPlayers", players);
    expect(instance.state.players).toBe(players);
    expect(instance.state.me).toBe(player);
  });
  it("should do nothing if set players doesn't contain the player", () => {
    players.shift();
    socket.triggerEvent("setPlayers", players);
    players.unshift(player);
    expect(instance.state.players).toBe(players);
    expect(instance.state.me).toBe(player);
  });
  it("should update the discard pile", () => {
    const discards = generateCards([
      ["A", "S"],
      ["Q", "H"],
    ]);
    socket.triggerEvent("setDiscards", discards);
    expect(instance.state.discards).toBe(discards);
  });
  it("should update the currentPlayer", () => {
    expect(instance.state.currentPlayer).toEqual("");
    socket.triggerEvent("setCurrentPlayer", player.username);
    expect(instance.state.currentPlayer).toEqual(player.username);
  });
  it("should send a message to the server", () => {
    const message = "This is a test";
    instance.sendMessage(message);
    expect(socket.socketMessages.length).toEqual(1);
    const sentMessage = socket.socketMessages.shift();
    expect(sentMessage.nsp).toEqual("sendMessage");
    expect(sentMessage.data).toEqual(message);
  });
  describe("canClickCard", () => {
    it("can't click card if not current player", () => {
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: "test",
      });
      expect(instance.canClickCard()).toBeFalsy();
      // this state shouldn't really exist
      player.hasDrawn = true;
      instance.setState({
        me: player,
      });
      expect(instance.canClickCard()).toBeFalsy();
    });
    it("can't click card if current player but has already drawn", () => {
      player.hasDrawn = true;
      instance.setState({
        me: player,
        currentPlayer: player.username,
      });
      expect(instance.canClickCard()).toBeFalsy();
    });
    it("can click card if current player and haven't drawn", () => {
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: player.username,
      });
      expect(instance.canClickCard()).toBeTruthy();
    });
  });
  it("should be able to trigger the start of a game", () => {
    instance.HandleStartGame();
    expect(socket.socketMessages.length).toEqual(1);
    const message = socket.socketMessages.shift();
    expect(message.nsp).toEqual("startGame");
  });
  describe("HandleMoveCard", () => {
    it("should move the card to the right place", () => {
      let currentHand = instance.state.me.hand;
      const movingCard = currentHand.shift();
      currentHand.push(movingCard);
      instance.HandleMoveCard(0, currentHand.length - 1);
      expect(instance.state.me.hand).toBe(currentHand);
    });
    it("should be able to move card left", () => {
      let currentHand = instance.state.me.hand;
      const movingCard = currentHand.pop();
      currentHand.unshift(movingCard);
      instance.HandleMoveCard(currentHand.length - 1, 0);
      expect(instance.state.me.hand).toBe(currentHand);
    });
  });
  describe("Handle deck click", () => {
    it("should do nothing if the player is not able to click the card", () => {
      socket.clearMessages();
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: "test",
      });
      instance.HandleDeckClick();
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("should send the relevant messages to the server", () => {
      socket.clearMessages();
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: player.username,
      });
      instance.HandleDeckClick();
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("getDeckCard");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("sendMessage");
      expect(message.data).toEqual("card selected from deck");
    });
  });
  describe("Handle discard click", () => {
    it("should do nothing if the player is not able to click the card", () => {
      socket.clearMessages();
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: "test",
      });
      instance.HandleDiscardClick();
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("should send the relevant messages to the server", () => {
      socket.clearMessages();
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: player.username,
      });
      instance.HandleDiscardClick();
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("getDiscardCard");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("sendMessage");
      expect(message.data).toEqual("card selected from discard");
    });
  });
  it("should mark the card as selected when clicked", () => {
    expect(instance.state.me.hand[1].selected).toBeFalsy();
    instance.HandleClickedCard(1);
    expect(instance.state.me.hand[1].selected).toBeTruthy();
    instance.HandleClickedCard(1);
    expect(instance.state.me.hand[1].selected).toBeFalsy();
  });
  it("should be able to discard a card", () => {
    const currentHand = [...instance.state.me.hand];
    instance.state.me.hand[1].selected = true;
    instance.HandleCardDiscard();
    expect(socket.socketMessages.length).toEqual(1);
    const message = socket.socketMessages.shift();
    expect(message.nsp).toEqual("setDiscard");
    expect(message.data.discard).toBe(currentHand[1]);
    expect(message.data.hand.length).toBe(currentHand.length - 1);
    player.hand = currentHand;
    instance.setState({ me: player });
  });
  describe("sendTable", () => {
    const table = [
      generateCards([
        ["A", "C"],
        ["2", "C"],
        ["3", "C"],
      ]),
      generateCards([
        ["6", "D"],
        ["6", "S"],
        ["6", "H"],
      ]),
    ];
    const hand = generateCards([
      ["3", "C"],
      ["8", "H"],
      ["9", "D"],
    ]);
    it("should send current users table if no userame", () => {
      instance.sendTable(table, hand);
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      expect(message.data.username).toEqual(player.username);
      expect(message.data.hand).toBe(hand);
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(message.data.username).toEqual(player.username);
      expect(message.data.table).toBe(table);
    });
    it("should send other users table if specified", () => {
      const otherPlayer = "jen";
      instance.sendTable(table, hand, otherPlayer);
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      expect(message.data.username).toEqual(player.username);
      expect(message.data.hand).toBe(hand);
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(message.data.username).toEqual(otherPlayer);
      expect(message.data.table).toBe(table);
    });
  });
  it("should send the right messages for updateMyTable", () => {
    const table = [
      generateCards([
        ["A", "C"],
        ["2", "C"],
        ["3", "C"],
      ]),
      generateCards([
        ["6", "D"],
        ["6", "S"],
        ["6", "H"],
      ]),
    ];
    instance.updateMyTable(table);
    expect(socket.socketMessages.length).toEqual(2);
    let message = socket.socketMessages.shift();
    expect(message.nsp).toEqual("setHand");
    expect(message.data.username).toEqual(player.username);
    expect(message.data.hand).toBe(player.hand);
    message = socket.socketMessages.shift();
    expect(message.nsp).toEqual("setTable");
    expect(message.data.username).toEqual(player.username);
    expect(message.data.table).toBe(table);
  });
  describe("canAddToGroup", () => {
    it("should be able to add to group if the players turn has started", () => {
      player.hasDrawn = true;
      instance.setState({
        me: player,
        currentHand: player.username,
      });
      expect(instance.canAddToGroup()).toBeTruthy();
    });
    it("should not be able to add to a group if player hasn't drawn", () => {
      player.hasDrawn = false;
      instance.setState({
        me: player,
        currentPlayer: player.username,
      });
      expect(instance.canAddToGroup()).toBeFalsy();
    });
    it("should not be able to add to group if not players turn", () => {
      instance.setState({
        currentPlayer: "test",
      });
      expect(instance.canAddToGroup()).toBeFalsy();
    });
  });
  describe("hasValidTable", () => {
    it("should be valid if the table is empty", () => {
      player.table = [];
      instance.setState({ me: player });
      expect(instance.hasValidTable()).toBeTruthy();
    });
    it("should be valid if the player has already gone down", () => {
      player.hasGoneDown = true;
      instance.setState({ me: player });
      expect(instance.hasValidTable()).toBeTruthy();
    });
    it("should handle 1 set for 1 set rules", () => {
      const round = {
        numSets: 1,
        setSize: 3,
        title: "My Title",
      };
      const table = [
        generateCards([
          ["3", "C"],
          ["3", "H"],
          ["3", "D"],
        ]),
      ];
      player.table = table;
      player.hasGoneDown = false;
      instance.setState({ me: player, currentRound: round });
      expect(instance.hasValidTable()).toBeTruthy();
    });
    it("should handle 2 sets for 2 set rules", () => {
      const round = {
        numSets: 2,
        setSize: 3,
        title: "My Title",
      };
      const table = [
        generateCards([
          ["3", "C"],
          ["3", "H"],
          ["3", "D"],
        ]),
        generateCards([
          ["4", "C"],
          ["4", "H"],
          ["4", "D"],
        ]),
      ];
      player.table = table;
      player.hasGoneDown = false;
      instance.setState({ me: player, currentRound: round });
      expect(instance.hasValidTable()).toBeTruthy();
    });
    it("should handle 1 sets for 2 set rules", () => {
      const round = {
        numSets: 2,
        setSize: 3,
        title: "My Title",
      };
      const table = [
        generateCards([
          ["3", "C"],
          ["3", "H"],
          ["3", "D"],
        ]),
      ];
      player.table = table;
      player.hasGoneDown = false;
      instance.setState({ me: player, currentRound: round });
      expect(instance.hasValidTable()).toBeFalsy();
    });
  });
  describe("hasValidGroup", () => {
    const round = {
      numSets: 2,
      setSize: 3,
      title: "My Title",
    };
    instance.setState({ currentRound: round });
    const cards = generateCards([
      ["3", "C"],
      ["3", "H"],
    ]);
    cards.forEach((card) => (card.selected = true));
    it("should return invalid if less than 3 cards are selected", () => {
      player.hand = player.hand.concat(cards);
      player.table = [];
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeFalsy();
    });
    it("should return invalid if we haven't gone down and the group is the wrong size", () => {
      player.hand = player.hand.concat(cards);
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeFalsy();
    });
    it("should return invalid if we haven't gone down and we putting down too many sets", () => {
      player.hand.pop();
      const newTable = player.hand.filter((card) => card.selected);
      player.table = newTable;
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeFalsy();
    });
    it("should return valid, with a valid group", () => {
      player.table = [];
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeTruthy();
    });
    it("should return invalid if the group is invalid", () => {
      player.hand[player.hand.length - 1].rank = "4";
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeFalsy();
    });
    it("should let you put down sets, if the player has already gone down", () => {
      player.hand[player.hand.length - 1].rank = "3";
      const newTable = player.hand.filter((card) => card.selected);
      player.table = [newTable, newTable];
      player.hasGoneDown = true;
      instance.setState({ me: player });
      expect(instance.hasValidGroup()).toBeTruthy();
    });
  });
  describe("addToGroup", () => {
    const tableGroup = generateCards([
      ["2", "D"],
      ["3", "D"],
      ["4", "D"],
    ]);
    const validStart = generateCards([["A", "D"]]);
    const validEnd = generateCards([["5", "D"]]);
    const validGroup = generateCards([
      ["5", "D"],
      ["6", "D"],
      ["7", "D"],
    ]);
    const invalidCard = generateCards([["A", "S"]]);
    it("should not add to group if the user hasn't started their turn", () => {
      player.hasDrawn = false;
      player.hasGoneDown = true;
      instance.setState({ me: player, currentPlayer: "test" });
      expect(instance.addToGroup(tableGroup, validStart)).toEqual([]);
      instance.setState({ currentPlayer: player.username });
      expect(instance.addToGroup(tableGroup, validStart)).toEqual([]);
    });
    it("should not add to group if the user hasn't gone down", () => {
      player.hasDrawn = true;
      player.hasGoneDown = false;
      instance.setState({ me: player, currentPlayer: player.username });
      expect(instance.addToGroup(tableGroup, validStart)).toEqual([]);
    });
    it("should not add to group if group would be invalid", () => {
      player.hasDrawn = true;
      player.hasGoneDown = true;
      instance.setState({ me: player, currentPlayer: player.username });
      expect(instance.addToGroup(tableGroup, invalidCard)).toEqual([]);
    });
    it("should be able to add to start of group", () => {
      player.hasDrawn = true;
      player.hasGoneDown = true;
      instance.setState({ me: player, currentPlayer: player.username });
      const expectedGroup = validStart.concat(tableGroup);
      expect(instance.addToGroup(tableGroup, validStart)).toEqual(
        expectedGroup
      );
    });
    it("should be able to add to end of group", () => {
      player.hasDrawn = true;
      player.hasGoneDown = true;
      instance.setState({ me: player, currentPlayer: player.username });
      const expectedGroup = tableGroup.concat(validEnd);
      expect(instance.addToGroup(tableGroup, validEnd)).toEqual(expectedGroup);
    });
    it("should be able to add multiple cards to the group", () => {
      player.hasDrawn = true;
      player.hasGoneDown = true;
      instance.setState({ me: player, currentPlayer: player.username });
      const expectedGroup = tableGroup.concat(validGroup);
      expect(instance.addToGroup(tableGroup, validGroup)).toEqual(
        expectedGroup
      );
    });
  });
  describe("HandleAddToTableGroup", () => {
    player.hasGoneDown = true;
    player.hand.push(generateCard("9", "C"));
    player.hand[3].selected = true;
    it("shouldn't add to table if haven't started turn", () => {
      player.hasDrawn = false;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToTableGroup(0);
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("should add to table if the card is valid", () => {
      player.hasDrawn = true;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToTableGroup(0);
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(player.hand.length).toEqual(3);
    });
    it("shouldn't do anything if no cards selected", () => {
      player.hasDrawn = true;
      player.hand.push(generateCard("9", "C"));
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToTableGroup(0);
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("shouldn't add to table if card won't fit", () => {
      player.hasDrawn = true;
      player.hand[3].selected = true;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToTableGroup(0);
      expect(socket.socketMessages.length).toEqual(0);
    });
    player.hand.pop();
  });
  describe("HandleAddToOtherTable", () => {
    player.hasGoneDown = true;
    player.hand.push(generateCard("9", "C"));
    player.hand[3].selected = true;
    const otherPlayer = players[1];
    it("shouldn't add to table if haven't started turn", () => {
      player.hasDrawn = false;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToOtherTable(0, otherPlayer);
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("should add to table if the card is valid", () => {
      player.hasDrawn = true;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToOtherTable(0, otherPlayer);
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(message.data.username).toEqual(otherPlayer.username);
      expect(player.hand.length).toEqual(3);
    });
    it("shouldn't do anything if no cards selected", () => {
      player.hasDrawn = true;
      player.hand.push(generateCard("9", "C"));
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToOtherTable(0, otherPlayer);
      expect(socket.socketMessages.length).toEqual(0);
    });
    it("shouldn't add to table if card won't fit", () => {
      player.hasDrawn = true;
      player.hand[3].selected = true;
      instance.setState({ me: player, currentPlayer: player.username });
      instance.HandleAddToOtherTable(0, otherPlayer);
      expect(socket.socketMessages.length).toEqual(0);
    });
    player.hand.pop();
  });
  describe("Handle Card Lay and undo", () => {
    const newCards = generateCards([
      ["9", "D"],
      ["9", "D"],
      ["2", "C"],
    ]);
    test("HandleCardLay should update the table with the selected cards", () => {
      newCards.forEach((card) => (card.selected = true));
      player.hand = player.hand.concat(newCards);
      instance.setState({ me: player });
      instance.HandleCardLay();
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(player.table.length).toEqual(3);
    });
    test("HandleUndoCardLay should remove the last set from the table", () => {
      const currentLength = player.hand.length;
      player.table = [newCards];
      instance.HandleUndoCardLay();
      expect(socket.socketMessages.length).toEqual(2);
      let message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setHand");
      message = socket.socketMessages.shift();
      expect(message.nsp).toEqual("setTable");
      expect(message.data.table).toEqual([]);
      expect(player.hand.length).toEqual(currentLength + 3);
    });
    test("HandleUndoCardLay should do nothing if there aren't any cards on table", () => {
      instance.HandleUndoCardLay();
      expect(socket.socketMessages.length).toEqual(0);
    });
  });
  it("should display start game button if player can start game", () => {
    player.canStartGame = true;
    instance.setState({ me: player });
    const startRow = game.find("Fragment").last();
    expect(startRow.prop("style")).toBeUndefined();
  });
});
