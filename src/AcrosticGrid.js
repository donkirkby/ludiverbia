import React, { useState } from 'react';
import {DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';

import {LetterSpace} from './LetterSpace';
import {LetterTile} from './LetterTile';
import {Draggable} from './Draggable';
import { LetterSet } from './LetterSet';

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
          spaceLabel = ' ',
          disabled = false,
          onClick = null,
          isHidden = false;
        className = 'cell';
        letter = letterSet.getLetter(row, column);
        if (letter) {
          disabled = props.isReady;
        }
        else if (props.isReady) {
          letter = spaceLabel;
          disabled = props.disabled;
          onClick = handleHit;
        }
        if (letter !== null && letter !== draggedLetter) {
          const tileId = 'tile' + row + column,
            dragId = 'drag' + row + column;
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

    function handleDragStart(event) {
      const dragId = event.active.id,
        dragRow = parseInt(dragId.slice(-2)),
        dragColumn = parseInt(dragId.slice(-1));
      letterSet.drag(dragRow, dragColumn);
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
      const dropId = event.over && event.over.id,
        dropRow = dropId && parseInt(dropId.slice(-2)),
        dropColumn = dropId && parseInt(dropId.slice(-1));
      if (dropId) {
        letterSet.drop(dropRow, dropColumn);
        props.onLettersChange(letterSet.format());
      }
      setDraggedLetter(null);
    }

    function handleReady(event) {
      event.preventDefault();
      props.onReady();
    }
}
