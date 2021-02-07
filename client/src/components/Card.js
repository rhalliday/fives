import React from "react";

import { getImageLocation, getCardImageName } from "./Utils";

function Card(props) {
  let imageName = getCardImageName(props.card);
  return (
    <div className="Card" onClick={props.onClick}>
      <img
        src={getImageLocation(imageName)}
        alt={imageName}
        width="100%"
        height="100%"
      />
    </div>
  );
}

export default Card;