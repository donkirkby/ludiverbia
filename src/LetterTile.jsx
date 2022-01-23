import React from 'react';

export function LetterTile(props) {
  const className = 'letter-tile button is-primary' + 
    (props.isHidden ? ' is-light' : '');
  return (
    <button
        type="button"
        className={className}
        disabled={props.disabled}
        onClick={props.onClick}>
      {props.text}
    </button>
  );
}
