import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import PlayerDisplay from "./PlayerDisplay";

import { Player } from "../types/Player";

type playerProps = {
  players: Player[];
  currentPlayer: string;
  handleAddToGroup: Function;
};

function Players(props: playerProps) {
  let players = props.players;
  let playerList = players.map((player) => {
    return (
      <ListGroup.Item
        key={player.username}
        style={{
          backgroundColor:
            player.username === props.currentPlayer ? "#0f0" : "",
        }}
      >
        <PlayerDisplay
          player={player}
          handleAddToGroup={props.handleAddToGroup}
        />
      </ListGroup.Item>
    );
  });
  return (
    <div>
      <h4>Players</h4>
      <ListGroup>{playerList}</ListGroup>
    </div>
  );
}

export default Players;
