import React, { useState } from 'react';
import {DndContext, DragOverlay} from '@dnd-kit/core';

import {LetterSpace} from './LetterSpace';
import {LetterTile} from './LetterTile';
import {Draggable} from './Draggable';

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


function coordinatesToLabel(row, column) {
  return `${row+4}${column-1}`;
}

function invertMap(items) {
  return Object.fromEntries(
    Object.entries(items).map(([key, value]) => [value, key]));
}

/** Update the letters state when drag and drop ends.
 * 
 * @param {*} draggedLetter - letter that just got dropped
 * @param {*} targetId - space id where it was dropped, or undefined if it was
 *  dropped outside the grid
 * @param {*} oldLetters - current letters in each space {label: letter}
 * @returns newLetters if something changed, otherwise undefined
 */
export function dropLetter(draggedLetter, targetId, oldLetters) {
  const newLetters = Object.assign({}, oldLetters),
    letterLabels = invertMap(oldLetters),
    oldLabel = letterLabels[draggedLetter];
  if (oldLabel !== undefined) {
    delete newLetters[oldLabel];
  }
  if (targetId && targetId.startsWith('cell')) {
    // dropped over a container, record new position
    const coordinateText = targetId.slice(-2),
      row = parseInt(coordinateText[0]),
      column = parseInt(coordinateText[1]),
      targetLabel = coordinatesToLabel(row, column);
    newLetters[targetLabel] = draggedLetter;
    return newLetters;
  }
  else {
    // reset to default
    if (oldLabel !== undefined) {
      return newLetters;
    }
  }
}


/** Grid of letters for the Quizl game
 * 
 * @param props.letters - object with labels as keys and letters as
 *  values, hidden letters are lower case
 * @param props.onLettersChange - callback when letters change
 * @param props.player - player name
 * @param props.onPlayerChange - callback when name changes
 * @param props.isReady - true if Ready button has been clicked, or grid
 *  belongs to an opponent
 * @param props.onReady - callback when Ready button is clicked
 * @param props.onHit - callback when a target button is clicked, receives
 *  label
 */
export function QuizlGrid(props) {
    const containers = [],
      [draggedLetter, setDraggedLetter] = useState(null),
      letterLabels = invertMap(props.letters),
      isGridFull = Object.entries(props.letters).length === 25;
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const coordinateText = `${row}${column}`,
          spaceLabel = coordinatesToLabel(row, column),
          defaultIndex = defaultPositions.indexOf(coordinateText),
          isSpacer = defaultIndex === -1 && (
            row === 0 || row === size-1 || row === size-2 || column === size-2);
        let tile = null, className = '', letter = null;
        if (defaultIndex !== -1) {
          className = 'home';
          letter = String.fromCharCode(65+defaultIndex);
          if (letterLabels[letter] !== undefined) {
            letter = null;  // dragged away
          }
        }
        else if (isSpacer) {
          className = 'spacer';
        }
        else {
          className = 'cell';
          letter = props.letters[spaceLabel] || null;
        }
        if (letter !== null && letter !== draggedLetter) {
          const tileId = 'tile' + letter;
          tile = (
            <Draggable key={tileId} id={tileId}>
              <LetterTile text={letter}/>
            </Draggable>
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
      <form onSubmit={handleReady} className="quizl">
        {props.isReady ? <p>{props.player}</p> : (
          <div className="player">
            <input
              className="input is-large"
              type="text"
              placeholder="Your Name"
              value={props.player}
              onChange={handlePlayerChange}/>
            <button
              className="button is-large is-primary"
              disabled={ ! isGridFull}>Ready</button>
          </div>)}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="board">
            {containers}
          </div>
          <DragOverlay>
            {draggedLetter && <LetterTile text={draggedLetter}/>}
          </DragOverlay>
        </DndContext>
      </form>
    );

    function handlePlayerChange(event) {
      props.onPlayerChange(event.target.value);
    }

    function handleDragStart(event) {
      if (props.isReady) {
        return;
      }
      setDraggedLetter(event.active.id.slice(-1));
    }
    
    function handleDragEnd(event) {
      if (props.isReady) {
        return;
      }
      const newLetters = dropLetter(
        draggedLetter,
        event.over && event.over.id,
        props.letters);
      if (newLetters !== undefined) {
        props.onLettersChange(newLetters);
      }
      setDraggedLetter(null);
    }

    function handleReady(event) {
      event.preventDefault();
      props.onReady();
    }
}
