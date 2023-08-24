import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function LetterSpace(props) {
  const {isOver, setNodeRef} = useDroppable(
    {id: props.id}),
    className = props.className === 'home'
        ? ' has-background-info-light'
        : props.className === 'spacer'
        ? ''
        : isOver
        ? ' has-background-primary-dark'
        : ' has-background-primary-light';
  
  
  return (
    <div id={`letter-space-${props.id}`}
        ref={setNodeRef}
        className={'letter-space ' + props.className + className}>
      {props.children}
    </div>
  );
}
