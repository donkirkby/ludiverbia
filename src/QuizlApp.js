import { useState } from 'react';
import { set, push, ref, child, off, onValue } from '@firebase/database';

import './App.css';
import './QuizlApp.css';
import { PlayerSet } from './PlayerSet'
import { QuizlGrid } from './QuizlGrid';

export default function QuizlApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),
      [players, setPlayers] = useState([]),
      [isReady, setReady] = useState(false),
      [hits, setHits] = useState([]),

      // {playerId: hitCount}
      [hitCounts, setHitCounts] = useState({}),

      // [{id: id, name: name, letters: {label: letter}}]
      [opponents, setOpponents] = useState([]),
      [gameId, setGameId] = useState(''),
      [nextPlayerId, setNextPlayerId] = useState(),
      dataSource = props.dataSource,
      quizlRef = dataSource && dataSource.check() &&
        ref(dataSource.database, 'games/quizl'),
      gameRef = quizlRef && gameId && child(quizlRef, gameId),
      readyRef = gameRef && child(
        gameRef,
        `playing/${dataSource.userId}/isReady`),
      requestsRef = gameRef && child(gameRef, 'requests'),
      responsesRef = gameRef && child(gameRef, 'responses');
    
    if (gameRef) {
      off(requestsRef);
      onValue(requestsRef, handleRequestsChange);
      off(responsesRef);
      onValue(responsesRef, handleResponsesChange);
    }

    return <div className="quizl-outer tile is-ancestor">
      <div className="quizl-grids tile is-parent is-vertical">
        <PlayerSet
          dataSource={dataSource}
          gameType="quizl"
          gameId={gameId}
          onGameIdChange={setGameId}
          players={players}
          onPlayersChange={handlePlayersChange}/>
        <QuizlGrid
          player={player}
          onPlayerChange={setPlayer}
          letters={letters}
          onLettersChange={handleLettersChange}
          isNext={dataSource.userId === nextPlayerId}
          isReady={isReady}
          onReady={handleReady}/>
        {opponents.map((opponent, i) => (
          ! opponent.isReady
          ? <p key={`opponent${i}`}
              className="quizl tile notification is-child is-light">
              {opponent.name}
            </p>
          : <QuizlGrid
            key={`opponent${i}`}
            player={opponent.name}
            letters={opponent.letters}
            isNext={opponent.id === nextPlayerId}
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

    function handlePlayersChange(newPlayers) {
        const newOpponents = newPlayers.map(playerInfo => Object.assign(
            {letters: {}},
            playerInfo));
        chooseNextPlayer(newOpponents, hitCounts);
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

        const newNextPlayerId = chooseNextPlayer(players, hitCounts);
        if (newNextPlayerId !== nextPlayerId) {
          setNextPlayerId(newNextPlayerId);
        }
    }

    function handleReady() {
      const newLetters = Object.fromEntries(Object.entries(letters).map(
        ([label, letter]) => [label, letter.toLowerCase()]));
      setReady(true);
      setLetters(newLetters);
      set(readyRef, true);
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

/** Choose one of the players to go next.
 * @param players: [{seat, id, letters: {label: letter}}] letters are lower case
 *  if hidden
 * @param hitCounts: {playerId: count}
 * @returns: id of chosen player.
 */
export function chooseNextPlayer(players, hitCounts) {
  if ( ! players.length) {
    return;
  }
  let chosen = 0,
    minCount = hitCounts[players[0].id] || 0;

  for (let i = 1; i < players.length; i++) {
    const player = players[i],
      playerCount = hitCounts[player.id] || 0;
    if (minCount < playerCount) {
      // not chosen
    }
    else if (playerCount < minCount) {
      minCount = playerCount;
      chosen = i;
    }
    else if (player.seat < players[chosen].seat) {
      chosen = i;
    }
  }
  return players[chosen].id;
}