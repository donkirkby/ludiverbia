import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export function LetterTile(props) {
  const {attributes, listeners, setNodeRef} = useDraggable({
    id: props.id,
  });

  
  return (
    <div className="letter-tile has-text-centered has-text-white has-background-primary"
        ref={setNodeRef}
        {...listeners}
        {...attributes}>
      {props.children}
    </div>
  );
}
