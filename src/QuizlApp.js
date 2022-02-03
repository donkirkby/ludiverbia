import { useState } from 'react';
import { set, push, ref, child, off, onValue } from '@firebase/database';

import './App.css';
import './QuizlApp.css';
import { PlayerSet } from './PlayerSet'
import { QuizlGrid } from './QuizlGrid';

export default function QuizlApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),
      [isReady, setReady] = useState(false),
      [hits, setHits] = useState([]),

      // [{id: id, name: name, letters: {label: letter}}]
      [opponents, setOpponents] = useState([]),
      [gameId, setGameId] = useState(''),
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
      <div className="quizl-grids">
        <PlayerSet
          dataSource={dataSource}
          gameType="quizl"
          gameId={gameId}
          onGameIdChange={setGameId}/>
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
      </div>
      <div className="quizl-hits">
        {hits.map((hit, i) => <p key={`hit${i}`}>{hit}</p>)}
      </div>
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
              newOpponent = Object.assign({letters: {}}, oldOpponent);
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
        push(requestsRef, {player: dataSource.userId, label: label});
      }
    }

    function handleRequestsChange(snapshot) {
      const requestsInfo = snapshot.val();
      if (requestsInfo === null || ! isReady) {
          return;
      }
      let hasResponseChanged = false;
      const response = {},
        newLetters = Object.assign({}, letters),
        playerNames = Object.fromEntries(opponents.map(
          opponent => [opponent.id, opponent.name])),
        requestValues = Object.values(requestsInfo),
        newHits = [];
      playerNames[dataSource.userId] = player;
      let haveHitsChanged = requestValues.length !== hits.length;
      for (const request of requestValues) {
        const playerName = playerNames[request.player],
          hitText = `${playerName} hit ${request.label}`,
          hitIndex = newHits.length;
        newHits.push(hitText);
        haveHitsChanged = haveHitsChanged || hitText !== hits[hitIndex];
        if (request.player === dataSource.userId) {
          continue;
        }
        const letter = letters[request.label] || '?',
          upperLetter = letter.toUpperCase();
        response[request.label] = upperLetter;
        if (letter !== upperLetter) {
          hasResponseChanged = true;
          newLetters[request.label] = upperLetter;
        }
      }
      if (hasResponseChanged) {
        setLetters(newLetters);
        set(child(responsesRef, dataSource.userId), response);
      }
      if (haveHitsChanged) {
        setHits(newHits);
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
