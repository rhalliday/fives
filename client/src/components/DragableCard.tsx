import React, { MouseEventHandler, useRef } from "react";
import { useDrag, useDrop, DragObjectWithType } from "react-dnd";

import { ItemTypes } from "../Constants";
import Card from "./Card";
import { Card as CardT } from "../types/Card";

type dcProps = {
  index: number;
  moveCard: Function;
  clickCard: MouseEventHandler;
  card: CardT;
};

type hoverItem = DragObjectWithType & {
  index: number;
};

function DragableCard(props: dcProps) {
  const index = props.index;
  const moveCard = props.moveCard;
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: hoverItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get horizontal middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (clientOffset === null) {
        return;
      }
      // Get pixels to the top
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      // Dragging right
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      // Dragging left
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{
        opacity: opacity,
      }}
      className="Card-parent"
      onClick={props.clickCard}
      data-testid={`draggable-card-${index}`}
    >
      <Card card={props.card} />
    </div>
  );
}

export default DragableCard;
