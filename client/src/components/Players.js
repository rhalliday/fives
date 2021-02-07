import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import PlayerDisplay from "./PlayerDisplay";

function Players(props) {
  let players = props.players;
  let playerList = players.map((player) => {
    let clickHandler = (event) => {
      props.handleClickPlayer(player);
    };
    return (
      <ListGroup.Item
        key={player.username}
        onClick={clickHandler}
        style={{
          backgroundColor:
            player.username === props.currentPlayer ? "#0f0" : "",
        }}
      >
        <PlayerDisplay player={player} />
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
