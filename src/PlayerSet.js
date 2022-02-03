import { useState } from 'react';
import { ref, child, push, set } from "firebase/database";

/** Create a set of players and a waiting room.
 * 
 * @param props.dataSource - database connection
 * @param props.gameType - game code to write in the database
 * @param props.gameId - id for an existing game to join
 * @param props.onGameIdChange - when game id gets typed in or created in db
 * @param props.playerNames - maps player ids to names
 * @param props.onPlayerNamesChange - when database updates or name is typed
 */
export function PlayerSet(props) {
    const [playerName, setPlayerName] = useState(''),
        [isConnected, setConnected] = useState(false),
        dataSource = props.dataSource,
        gameListRef = dataSource && dataSource.check() && props.gameType &&
          ref(dataSource.database, 'games/' + props.gameType);
    
    return <form onSubmit={handleStart}>
        <input
            type="text"
            className="input is-large"
            placeholder="Your name"
            value={playerName}
            disabled={isConnected}
            onChange={handlePlayerNameChange}/>
        <button
            type="button"
            onClick={handleStart}
            disabled={isConnected || ! (playerName && gameListRef)}
            className="button is-large is-primary">Start</button>
        <input
            type="text"
            className="input is-large"
            placeholder="Type game id here."
            value={props.gameId}
            readOnly={isConnected}
            onChange={handleGameIdChange}
            onKeyPress={handleGameIdKeyPress}/>
        <button
            type="button"
            onClick={handleJoin}
            disabled={isConnected || ! (props.gameId && gameListRef)}
            className="button is-large is-primary">Join</button>
        <button
            type="button"
            onClick={handleLeave}
            disabled={ ! isConnected}
            className="button is-large is-primary">Leave</button>

    </form>

    function handlePlayerNameChange(event) {
        setPlayerName(event.target.value);
    }

    function handleStart() {
        const gameRef = push(gameListRef, {
                owner: dataSource.userId,
                playing: {[dataSource.userId]: playerName}
            });
        setConnected(true);
        props.onGameIdChange(gameRef.key);
    }

    function handleGameIdChange(event) {
        props.onGameIdChange(event.target.value);
    }

    function handleGameIdKeyPress() {

    }

    function handleJoin() {
        const gameRef = child(gameListRef, props.gameId),
            waitingRef = child(gameRef, 'waiting'),
            playerRef = child(waitingRef, dataSource.userId);
        set(playerRef, playerName);
        setConnected(true);
    }

    function handleLeave() {
        props.onGameIdChange('');
        setConnected(false);
    }
}