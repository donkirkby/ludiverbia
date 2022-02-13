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

/** Randomly fill in blank spaces with unused letters.
 * 
 * @param {*} oldLetters - current letters in each space {label: letter}
 * @returns newLetters with all spaces filled in
 */
 export function fillLetters(oldLetters) {
  const newLetters = Object.assign({}, oldLetters),
    usedLetters = new Set(Object.values(oldLetters)),
    unusedLetters = [];
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(i+65);
    if ( ! usedLetters.has(letter)) {
      unusedLetters.push(letter);
    }
  }

  for (let row = 5; row < 10; row++) {
    for (let column = 0; column < 5; column++) {
      const label = `${row}${column}`,
        oldLetter = oldLetters[label];
      if ( ! oldLetter) {
        const chosenIndex = Math.random() * unusedLetters.length | 0;
        newLetters[label] = unusedLetters[chosenIndex]
        const popped = unusedLetters.pop();
        if (chosenIndex < unusedLetters.length) {
          unusedLetters[chosenIndex] = popped;
        }
      }
    }
  }
  return newLetters;
 }

/** Grid of letters for the Quizl game
 * 
 * @param props.letters - object with labels as keys and letters as
 *  values, hidden letters are lower case
 * @param props.onLettersChange - callback when letters change
 * @param props.player - player name
 * @param props.onPlayerChange - callback when name changes
 * @param props.isNext - true if this player should play next
 * @param props.isReady - true if Ready button has been clicked, or grid
 *  belongs to an opponent
 * @param props.onReady - callback when Ready button is clicked
 * @param props.disabled - true if grid belongs to an opponent, but game
 *  hasn't started
 * @param props.onHit - callback when a target button is clicked, receives
 *  label
 */
export function QuizlGrid(props) {
    const containers = [],
      [draggedLetter, setDraggedLetter] = useState(null),
      upperLetters = Object.fromEntries(Object.entries(props.letters).map(
        ([space, letter]) => [space, letter.toUpperCase()])),
      letterLabels = invertMap(upperLetters),
      isGridFull = Object.entries(upperLetters).length === 25;
    let hiddenCount = 0;
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const coordinateText = `${row}${column}`,
          spaceLabel = coordinatesToLabel(row, column),
          defaultIndex = defaultPositions.indexOf(coordinateText),
          isSpacer = defaultIndex === -1 && (
            row === 0 || row === size-1 || row === size-2 || column === size-2);
        let tile = null,
          className = '',
          letter = null,
          disabled = false,
          onClick = null,
          isHidden = false;
        if (defaultIndex !== -1) {
          className = 'home';
          letter = String.fromCharCode(65+defaultIndex);
          if (letterLabels[letter] !== undefined) {
            letter = null;  // dragged away
          }
          else {
            disabled = props.isReady;
          }
          isHidden = props.isReady;
        }
        else if (isSpacer) {
          className = 'spacer';
        }
        else {
          className = 'cell';
          letter = upperLetters[spaceLabel] || null;
          if (letter) {
            disabled = props.isReady;
            isHidden = letter !== props.letters[spaceLabel];
            if (isHidden) {
              hiddenCount++;
            }
          }
          else if (props.isReady) {
            letter = spaceLabel;
            disabled = props.disabled;
            onClick = handleHit;
            hiddenCount++;
          }
        }
        if (letter !== null && letter !== draggedLetter) {
          const tileId = 'tile' + letter,
            dragId = 'drag' + letter;
          tile = <LetterTile
            key={tileId}
            text={letter}
            isHidden={isHidden}
            disabled={disabled}
            onClick={onClick}/>;
          if ( ! props.isReady) {
            tile = <Draggable key={dragId} id={dragId}>
              <div className="draggable-letter">
                {tile}
              </div>
            </Draggable>;
          }
        }
        const spaceId = className + coordinateText;
        containers.push(
          <LetterSpace key={spaceId} id={spaceId} className={className}>
            {tile}
          </LetterSpace>);
      }
    }
    const colourClass = props.isNext ? 'is-primary' : ''

    return (
      <form onSubmit={handleReady}
        className={`quizl tile notification is-child ${colourClass} is-light`}>
        <p>{props.player} {hiddenCount || ''} {props.isNext}</p>
        {props.isReady || (
          <div className="player">
            <button
              className="button is-large is-primary m-1"
              disabled={ ! isGridFull}>Ready</button>
            <button
              className="button is-large is-primary m-1"
              onClick={handleFill}
              disabled={isGridFull}>Fill</button>
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

    function handleFill() {
      props.onLettersChange(fillLetters(props.letters));
    }

    function handleDragStart(event) {
      if (props.isReady) {
        return;
      }
      setDraggedLetter(event.active.id.slice(-1));
    }

    function handleHit(event) {
      if (props.onHit) {
        props.onHit(event.target.innerText);
      }
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
