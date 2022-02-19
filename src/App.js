import { useState } from 'react';
import './App.css';
import { PlayerSet } from './PlayerSet';
import './WordGrid';
import WordGrid from './WordGrid';

function App(props) {
  const [gameId, setGameId] = useState(),
    [players, setPlayers] = useState([]);

  return (
    <div className="App tile is-ancestor">
      <div className="tile is-parent is-vertical">
        <PlayerSet
            dataSource={props.dataSource}
            gameType="halfabet"
            gameId={gameId}
            onGameIdChange={handleGameIdChange}
            players={players}
            onPlayersChange={handlePlayersChange}/>
        <div className="tile is-child notification is-light">
          <WordGrid
            dataSource={props.dataSource}
            gameId={gameId}
            confirmReset="yes"/>
        </div>
      </div>
    </div>
  );

  function handlePlayersChange(newPlayers) {
    setPlayers(newPlayers);
  }

  function handleGameIdChange(newGameId) {
    setGameId(newGameId);
  }
}

export default App;
