import { useState } from 'react';
import { set, push, ref, child, off, onValue } from '@firebase/database';

import './App.css';
import './QuizlApp.css';
import { PlayerSet } from './PlayerSet'
import { QuizlGrid, scoreGuess } from './QuizlGrid';

export default function QuizlApp(props) {
    const [letters, setLetters] = useState({}),
      [player, setPlayer] = useState(''),

      /* [{id: id,
       *   isReady: isReady,
       *   name: name,
       *   seat: seat,
       *   score: score,
       *   guesses: [guessDisplay]}]
       */
      [players, setPlayers] = useState([]),
      [isReady, setReady] = useState(false),
      [isSolved, setSolved] = useState(false),
      [hits, setHits] = useState([]),

      // {playerId: hitCount}
      [hitCounts, setHitCounts] = useState({}),

      /* [{id: id,
       *   isReady: isReady,
       *   letters: {label: letter},
       *   name: name,
       *   seat: seat
       */
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
      off(responsesRef);
      onValue(responsesRef, handleResponsesChange);
      off(requestsRef);
      onValue(requestsRef, handleRequestsChange);
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
          isConnected={gameId !== ''}
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
            onGuess={guess => handleGuess(opponent.id, guess)}
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

    function handleGuess(opponentId, guess) {
      if (requestsRef) {
        push(requestsRef, {player: dataSource.userId, target: opponentId, guess: guess});
      }
    }

    function handleRequestsChange(snapshot) {
      const requestsInfo = snapshot.val();
      if (requestsInfo === null || ! isReady) {
          return;
      }
      let hasResponseChanged = false,
        haveLettersChanged = false;
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
          targetName = playerNames[request.target],
          hitIndex = newHits.length;
        let hitText = playerName;
        if (request.label) {
          hitText += `hit ${request.label}`;
        }
        else {
          hitText += `guessed ${request.label} for ${targetName}`;
        }
        newHits.push(hitText);
        haveHitsChanged = haveHitsChanged || hitText !== hits[hitIndex];
        newHitCounts[request.player] = (newHitCounts[request.player] || 0) + 1;
        if (request.player === dataSource.userId) {
          continue;
        }
        if (request.label) {
          const letter = letters[request.label] || '?',
            upperLetter = letter.toUpperCase();
          response[request.label] = upperLetter;
          if (letter !== upperLetter) {
            hasResponseChanged = true;
            haveLettersChanged = true;
            newLetters[request.label] = upperLetter;
          }
        }
        else {
          const upperGuess = request.guess.toUpperCase();
          if (request.target === dataSource.userId &&
              response[upperGuess] === undefined) {
            hasResponseChanged = true;
            const score = scoreGuess(request.guess, letters);
            if (score > 0 && ! isSolved) {
              setSolved(true);
            }
            response[upperGuess] = {player: request.player, score: score};
          }
        }
      }
      if (hasResponseChanged) {
        set(child(responsesRef, dataSource.userId), response);
      }
      if (haveLettersChanged) {
        setLetters(newLetters);
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
      for (const [playerId, playerResponses] of Object.entries(responsesInfo)) {
        const newGuesses = Object.entries(playerResponses).filter(
          ([key, value]) => key.length === 5);
        newGuesses.sort(([guess1, response1], [guess2, response2]) => (
          response2.score > response1.score
          ? 1
          : response2.score < response1.score
          ? -1
          : guess2 > guess1
          ? 1
          : -1));
        const newGuessDisplays = newGuesses.map(([guess, response]) => {
          const guesserName = opponentMap[response.player].name,
            result = response.score < 0 ? 'N' : response.score > 0 ? 'Y' : '?';
          return `${guess}: ${result} from ${guesserName}`
        });
        let haveGuessesChanged = newGuessDisplays.length !== opponentMap[playerId]
        if (newGuessDisplays.length !== 0) {
          
        }

        if (playerId === dataSource.userId) {
          continue;
        }
        const playerLetters = Object.fromEntries(Object.entries(playerResponses).filter(
          ([key, value]) => key.length === 2)),
          newOpponent = opponentMap[playerId],
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
 * @param players: [{seat, id, letters: {label: letter}, guesses: [display]}]
 *  letters are lower case if hidden
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