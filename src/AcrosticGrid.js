import React, { useState } from 'react';
import {DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';

import {LetterSpace} from './LetterSpace';
import {LetterTile} from './LetterTile';
import {Draggable} from './Draggable';
import { LetterSet } from './LetterSet';

const size = 8;

/** Grid of letters for the Acrostic game
 * 
 * @param props.letters - string with letter set state
 * @param props.onLettersChange - callback when letters change
 * @param props.player - player name
 * @param props.onPlayerChange - callback when name changes
 * @param props.isConnected - true if the Ready button could be clicked
 * @param props.isReady - true if Ready button has been clicked, or grid
 *  belongs to an opponent
 * @param props.onReady - callback when Ready button is clicked
 * @param props.disabled - true if grid belongs to an opponent, but game
 *  hasn't started
 */
export function AcrosticGrid(props) {
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor)),
      containers = [],
      [draggedLetter, setDraggedLetter] = useState(null),
      letterSet = new LetterSet(props.letters);
    for (let row = 0; row < letterSet.getSize(); row++) {
      for (let column = 0; column < letterSet.getSize(); column++) {
        const coordinateText = `${row}${column}`;
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
        className={`acrostic tile notification is-child ${colourClass} is-light`}>
        <p>{props.player}</p>
        <DndContext sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}>
          <div className="board">
            {containers}
          </div>
          <DragOverlay>
            {draggedLetter && <LetterTile text={draggedLetter}/>}
          </DragOverlay>
        </DndContext>
      </form>
    );

    function handleFill(event) {
      event.preventDefault();
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
