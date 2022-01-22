import React, { useState } from 'react';
import { set, ref, child, onValue } from '@firebase/database';

import './App.css';
import './QuizlApp.css';
import { QuizlGrid } from './QuizlGrid';

export default function QuizlApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),
      [isReady, setReady] = useState(false),
      [opponents, setOpponents] = useState([]),
      dataSource = props.dataSource,
      singletonRef = dataSource && dataSource.check() &&
        ref(dataSource.database, 'singleton/quizl'),
      playersRef = singletonRef && child(singletonRef, 'players');
    
    if (singletonRef) {
      const playersRef = child(singletonRef, 'players');
      onValue(playersRef, handlePlayersChange);
    }

    return <div className="quizl-outer">
        <QuizlGrid
          player={player}
          onPlayerChange={setPlayer}
          letters={letters}
          onLettersChange={setLetters}
          isReady={isReady}
          onReady={handleReady}/>
        {opponents.map((opponentName, i) => (
          <QuizlGrid
            key={`opponent${i}`}
            player={opponentName}
            letters={{}}
            isReady={true}/>
        ))}
      </div>;

    function arraysEqual(a, b) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i in a) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }

    function handlePlayersChange(snapshot) {
        const playersInfo = snapshot.val();
        if (playersInfo === null) {
            return;
        }
        const newOpponents = [];
        for (const [playerId, playerInfo] of Object.entries(playersInfo)) {
          if (playerId !== dataSource.userId) {
            newOpponents.push(playerInfo.name);
          }
        }
        if ( ! arraysEqual(newOpponents, opponents)) {
          setOpponents(newOpponents);
        }
    }

    function handleReady() {
      if (playersRef) {
        const playerRef = child(playersRef, dataSource.userId);
        set(playerRef, {name: player});
      }
      setReady(true);
    }
}
