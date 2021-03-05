import React, { MouseEventHandler } from "react";

import { getImageLocation, getCardImageName } from "./Utils";
import { Card as CardT } from "../types/Card";

type cardProps = {
  card: CardT;
  className?: string;
  onClick?: MouseEventHandler;
};

function Card(props: cardProps) {
  let imageName = getCardImageName(props.card);
  let className = "Card " + props.className;
  return (
    <div className={className} onClick={props.onClick}>
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
