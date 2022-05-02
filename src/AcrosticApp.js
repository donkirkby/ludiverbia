import { useState } from 'react';
import { set, push, ref, child, off, onValue } from '@firebase/database';

import './App.css';
import './LetterSetApp.css';
import { PlayerSet } from './PlayerSet'
import { AcrosticGrid } from './AcrosticGrid';

export default function AcrosticApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),
      [players, setPlayers] = useState([]),
      [gameWord, setGameWord] = useState(''),
      [isReady, setReady] = useState(false),

      [gameId, setGameId] = useState(''),
      dataSource = props.dataSource,
      acrosticRef = dataSource && dataSource.check() &&
        ref(dataSource.database, 'games/acrostic'),
      gameRef = acrosticRef && gameId && child(acrosticRef, gameId);
    
    return <div className="acrostic-outer tile is-ancestor">
      <div className="acrostic-grids tile is-parent is-vertical">
        <PlayerSet
          dataSource={dataSource}
          gameType="acrostic"
          gameId={gameId}
          onGameIdChange={setGameId}
          players={players}
          onPlayersChange={handlePlayersChange}/>
        <input
          type="text"
          className="input is-large"
          placeholder="Game word"
          value={gameWord}
          readOnly={isConnected}
          onChange={handleGameIdChange}
          onKeyPress={handleGameIdKeyPress}/>
        <button
          type="button"
          onClick={handleStart}
          disabled={
              isConnected ||
              newGameId ||
              ! (playerName && gameListRef)}
          className="button is-large is-primary m-1">Start</button>
        <AcrosticGrid
          player={player}
          onPlayerChange={setPlayer}
          letters={letters}
          onLettersChange={handleLettersChange}
          isConnected={gameId !== ''}
          isReady={isReady}
          onReady={handleReady}/>
        {opponents.map((opponent, i) => (
          ! opponent.isReady
          ? <p key={`opponent${i}`}
              className="acrostic tile notification is-child is-light">
              {opponent.name}
            </p>
          : <AcrosticGrid
            key={`opponent${i}`}
            player={opponent.name}
            letters={opponent.letters}
            isReady={true}/>
        ))}
      </div>
    </div>;

    function handleLettersChange(newLetters) {
      setLetters(newLetters);
    }

    function handlePlayersChange(newPlayers) {
        const newOpponents = newPlayers.map(playerInfo => Object.assign(
            {letters: {}},
            playerInfo));
        const newPlayer = newOpponents.shift(),
            hasPlayerChanged = newPlayer.name !== player;
        let haveOpponentsChanged = newOpponents.length !== opponents.length;

        if (hasPlayerChanged) {
          setPlayer(newPlayer.name);
        }
        
        for (let i = 0; i < newOpponents.length && ! haveOpponentsChanged; i++) {
          const oldOpponent = opponents[i],
            newOpponent = newOpponents[i],
            oldEntries = Object.entries(oldOpponent),
            newEntries = Object.entries(newOpponent);
          
          if (oldEntries.length !== newEntries.length) {
            haveOpponentsChanged = true;
            break;
          }
          for (let j = 0; j < oldEntries.length; j++) {
            const oldEntry = oldEntries[j],
              newEntry = newEntries[j];
            if (newEntry.id !== oldEntry.id ||
                newEntry.name !== oldEntry.name ||
                newEntry.isReady !== oldEntry.isReady) {
                  haveOpponentsChanged = true;
                  break;
            }
          }
        }
        if (haveOpponentsChanged) {
          setOpponents(newOpponents);
        }
        if (haveOpponentsChanged || hasPlayerChanged) {
          setPlayers(newPlayers);
        }
    }

    function handleReady() {
      const newLetters = Object.fromEntries(Object.entries(letters).map(
        ([label, letter]) => [label, letter.toLowerCase()]));
      setReady(true);
      setLetters(newLetters);
      set(readyRef, true);
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
        newHits = [],
        newHitCounts = {};
      playerNames[dataSource.userId] = player;
      let haveHitsChanged = requestValues.length !== hits.length;
      for (const request of requestValues) {
        const playerName = playerNames[request.player],
          hitText = `${playerName} hit ${request.label}`,
          hitIndex = newHits.length;
        newHits.push(hitText);
        haveHitsChanged = haveHitsChanged || hitText !== hits[hitIndex];
        newHitCounts[request.player] = (newHitCounts[request.player] || 0) + 1;
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
        setHitCounts(newHitCounts);
        const newNextPlayerId = chooseNextPlayer(players, newHitCounts);
        if (newNextPlayerId !== nextPlayerId) {
          setNextPlayerId(newNextPlayerId);
        }
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
