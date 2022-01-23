import React, { useState } from 'react';
import { set, update, ref, child, off, onValue } from '@firebase/database';

import './App.css';
import './QuizlApp.css';
import { QuizlGrid } from './QuizlGrid';

export default function QuizlApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),
      [isReady, setReady] = useState(false),

      // [{id: id, name: name, letters: {label: letter}}]
      [opponents, setOpponents] = useState([]),
      dataSource = props.dataSource,
      singletonRef = dataSource && dataSource.check() &&
        ref(dataSource.database, 'singleton/quizl'),
      playersRef = singletonRef && child(singletonRef, 'players'),
      requestsRef = singletonRef && child(singletonRef, 'requests'),
      responsesRef = singletonRef && child(singletonRef, 'responses');
    
    if (singletonRef) {
      const playersRef = child(singletonRef, 'players');
      off(playersRef);
      onValue(playersRef, handlePlayersChange);
      off(requestsRef);
      onValue(requestsRef, handleRequestsChange);
      off(responsesRef);
      onValue(responsesRef, handleResponsesChange);
    }

    return <div className="quizl-outer">
        <QuizlGrid
          player={player}
          onPlayerChange={setPlayer}
          letters={letters}
          onLettersChange={handleLettersChange}
          isReady={isReady}
          onReady={handleReady}/>
        {opponents.map((opponent, i) => (
          <QuizlGrid
            key={`opponent${i}`}
            player={opponent.name}
            letters={opponent.letters}
            isReady={true}
            onHit={handleHit}
            disabled={ ! isReady}/>
        ))}
      </div>;

    function handleLettersChange(newLetters) {
      setLetters(newLetters);
    }

    function handlePlayersChange(snapshot) {
        const playersInfo = snapshot.val();
        if (playersInfo === null) {
            return;
        }
        const oldOpponents = Object.fromEntries(opponents.map(
            opponent => [opponent.id, opponent])),
          playerEntries = Object.entries(playersInfo),
          newOpponents = [];
        let hasChanged = playerEntries.length !== opponents.length + 1;
        
        for (const [playerId, playerInfo] of playerEntries) {
          if (playerId !== dataSource.userId) {
            const oldOpponent = oldOpponents[playerId] || {},
              newOpponent = Object.assign({}, oldOpponent);
            if (playerInfo.name !== oldOpponent.name) {
              newOpponent.name = playerInfo.name;
              newOpponent.id = playerId;
              hasChanged = true;
            }
            newOpponents.push(newOpponent);
          } else if (player === '') {
            setPlayer(playerInfo.name);
          }
        }
        if (hasChanged) {
          setOpponents(newOpponents);
        }
    }

    function handleReady() {
      if (playersRef) {
        const playerRef = child(playersRef, dataSource.userId);
        set(playerRef, {name: player});
      }
      const newLetters = Object.fromEntries(Object.entries(letters).map(
        ([label, letter]) => [label, letter.toLowerCase()]));
      setReady(true);
      setLetters(newLetters);
    }

    function handleHit(label) {
      if (requestsRef) {
        update(
          child(requestsRef, dataSource.userId),
          {
            [label]: true
          });
      }
    }

    function handleRequestsChange(snapshot) {
      const requestsInfo = snapshot.val();
      if (requestsInfo === null || ! isReady) {
          return;
      }
      let hasChanged = false;
      const response = {},
        newLetters = Object.assign({}, letters);
      for (const [playerId, labels] of Object.entries(requestsInfo)) {
        if (playerId === dataSource.userId) {
          continue;
        }
        for (const label of Object.keys(labels)) {
          const letter = letters[label] || '?',
            upperLetter = letter.toUpperCase();
          response[label] = upperLetter;
          if (letter !== upperLetter) {
            hasChanged = true;
            newLetters[label] = upperLetter;
          }
        }
      }
      if (hasChanged) {
        setLetters(newLetters);
        set(child(responsesRef, dataSource.userId), response);
      }
    }

    function handleResponsesChange(snapshot) {
      const responsesInfo = snapshot.val();
      if (responsesInfo === null || ! isReady) {
          return;
      }
      const opponentMap = Object.fromEntries(opponents.map(
        opponent => [opponent.id, Object.assign(
          {},
          opponent,
          {letters: Object.assign({}, opponent.letters)})]));
      let hasChanged = false;
      for (const [playerId, playerLetters] of Object.entries(responsesInfo)) {
        if (playerId === dataSource.userId) {
          continue;
        }
        const newOpponent = opponentMap[playerId],
          oldLetterCount = Object.keys(newOpponent.letters).length,
          newLetterCount = Object.keys(playerLetters).length;
        if (oldLetterCount !== newLetterCount) {
          hasChanged = true;
          Object.assign(newOpponent.letters, playerLetters);
        }
      }
      if (hasChanged) {
        const newOpponents = [];
        for (const opponent of opponents) {
          newOpponents.push(opponentMap[opponent.id]);
        }
        setOpponents(newOpponents);
      }
    }
}
