import React from 'react';

export function LetterTile(props) {
  return (
    <div className="letter-tile has-text-centered has-text-white has-background-primary">
      {props.letter}
    </div>
  );
}
