import { useState } from 'react';

import './App.css';
import './LetterSet.css';
import { AcrosticGrid } from './AcrosticGrid';

export default function AcrosticApp(props) {
    const [letters, setLetters] = useState(''),
      [gameWord, setGameWord] = useState(''),
      [isStarted, setStarted] = useState(false),
      setupForm = (<div>
        <input
          type="text"
          className="input is-large"
          placeholder="Game word"
          value={gameWord}
          onChange={handleGameWordChange}/>
        <button
          type="button"
          onClick={handleStart}
          className="button is-large is-primary m-1">Start</button>
        </div>);
    
    return <div className="acrostic-outer tile is-ancestor">
      <div className="acrostic-grids tile is-parent is-vertical">
        {( ! isStarted && setupForm ) ||
        <AcrosticGrid
          letters={letters}
          onLettersChange={handleLettersChange}/> }
      </div>
    </div>;

    function handleGameWordChange(event) {
      setGameWord(event.target.value);
    }
    function handleStart() {
      setStarted(true);
      setLetters(gameWord);
    }
    function handleLettersChange(newLetters) {
      setLetters(newLetters);
    }
}
