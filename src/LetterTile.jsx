import React from 'react';

export function LetterTile(props) {
  return (
    <button className="letter-tile button is-primary">
      {props.text}
    </button>
  );
}
