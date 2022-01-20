import React, { useState } from 'react';
import {DndContext} from '@dnd-kit/core';

import './App.css';
import './QuizlApp.css';
import {LetterSpace} from './LetterSpace';
import {LetterTile} from './LetterTile';

const size = 8,
  defaultPositions = [];  // entry 0 for A, value is two-digit string: row, col
for (let i = 0; i < 26; i++) {
  if (i < size-2) {
    defaultPositions.push(`0${i+1}`);  // top row
  }
  else if (i < 2*size-3) {
    defaultPositions.push(`${i-size+2}${size-1}`);  // right column
  }
  else if (i < 3*size-4) {
    defaultPositions.push(`${i-2*size+4}0`);  // left column
  }
  else {
    defaultPositions.push(`${size-1}${i-3*size+5}`);  // bottom row
  }
}


function QuizlApp(props) {
    const containers = [],
      [positions, setPositions] = useState(Array.from(defaultPositions));
      /*,
      draggableMarkup = */
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const coordinateText = `${row}${column}`,
          defaultIndex = defaultPositions.indexOf(coordinateText),
          positionIndex = positions.indexOf(coordinateText),
          isSpacer = defaultIndex === -1 && (
            row === 0 || row === size-1 || row === size-2 || column === size-2);
        let tile = null, className = '';
        if (defaultIndex !== -1) {
          className = 'home';
        }
        else if (isSpacer) {
          className = 'spacer';
        }
        else {
          className = 'cell';
        }
        if (positionIndex !== -1) {
          const letter = String.fromCharCode(65+positionIndex),
            tileId = 'tile' + letter;
          tile = (
            <LetterTile key={tileId} id={tileId}>
              {letter}
            </LetterTile>
          );
        }
        const spaceId = className + coordinateText;
        containers.push(
          <LetterSpace key={spaceId} id={spaceId} className={className}>
            {tile}
          </LetterSpace>);
      }
    }
    
    return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="board">
          {containers}
        </div>
      </DndContext>
    );
    
    function handleDragEnd(event) {
      const letterIndex = event.active.id.charCodeAt(4) - 65,
        newPositions = Array.from(positions);
      if (event.over && event.over.id.startsWith('cell')) {
        // dropped over a container, record new position
        const coordinateText = event.over.id.slice(-2),
          oldLetterIndex = positions.indexOf(coordinateText);
        newPositions[letterIndex] = coordinateText;
        if (oldLetterIndex !== -1) {
          newPositions[oldLetterIndex] = defaultPositions[oldLetterIndex];
        }
      }
      else {
        // reset to default
        newPositions[letterIndex] = defaultPositions[letterIndex];
      }
      setPositions(newPositions);
    }
}

export default QuizlApp;
