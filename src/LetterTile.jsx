import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export function LetterTile(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <div className="letter-tile has-text-centered has-text-white has-background-primary"
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}>
      {props.children}
    </div>
  );
}
