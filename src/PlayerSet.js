import { useState, useEffect } from 'react';
import { ref, child, push, set, onValue } from "firebase/database";

/** Create a set of players and a waiting room.
 * 
 * @param props.dataSource - database connection
 * @param props.gameType - game code to write in the database
 * @param props.gameId - id for an existing game to join
 * @param props.onGameIdChange - when game id gets typed in or created in db
 * @param props.players - array of {id, name} objects
 * @param props.onPlayersChange - when database updates
 */
export function PlayerSet(props) {
    const [playerName, setPlayerName] = useState(''),
        [isConnected, setConnected] = useState(false),
        [isOwner, setOwner] = useState(false),
        [isPlaying, setPlaying] = useState(false),
        [waiting, setWaiting] = useState({}),
        dataSource = props.dataSource,
        players = props.players || [],
        gameListRef = dataSource && dataSource.check() && props.gameType &&
          ref(dataSource.database, 'games/' + props.gameType),
        gameRef = isConnected && gameListRef && child(gameListRef, props.gameId),
        waitingRef = gameRef && child(gameRef, 'waiting'),
        playingRef = gameRef && child(gameRef, 'playing'),
        gameHeader = isConnected
            ? <div>
                <p>Game id: {props.gameId}</p>
                <button
                    type="button"
                    onClick={handleLeave}
                    disabled={ ! isConnected}
                    className="button is-primary">Leave</button>
              </div>
            : <div>
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
            </div>,
        waitingEntries = Object.entries(waiting);
    waitingEntries.sort((a, b) => (
        a[1] < b[1]
        ? -1
        : a[1] > b[1]
        ? 1
        : a[0] < b[0]
        ? -1
        : a[0] > b[0]
        ? 1
        : 0));
    const waitingList = ! (isConnected && isOwner)
            ? null
            : waitingEntries.map(entry => (
                <p key={`waiting_${entry[0]}`}>{ entry[1] }
                <button
                    key={`allow_${entry[0]}`}
                    data-player={entry[0]}
                    className="button is-primary is-small"
                    onClick={handleAllowClick}>Allow</button>
                </p>
            )),
        playingList = ! isConnected
            ? null
            : players.map(entry =>  (
                <p key={`playing_${entry.id}`}>{ entry.name }</p>
            ));
    useEffect(() => {
        if ( ! gameRef) {
            return;
        }
        
        const myPlayingRef = child(playingRef, dataSource.userId),
            myPlayingOff = ( ! isPlaying) && onValue(
                myPlayingRef,
                handleMyPlayingChange,
                handleDbCancel),
            playingOff = isPlaying && onValue(
                playingRef,
                handlePlayingChange,
                handleDbCancel),
            waitingOff = isOwner && onValue(
                waitingRef,
                handleWaitingChange,
                handleDbCancel);

        return () => {
            // Unsubscribe from database updates.
            if (myPlayingOff) {
                myPlayingOff();
            }
            if (playingOff) {
                playingOff();
            }
            if (waitingOff) {
                waitingOff();
            }
        };
    });
    
    return <div>
        {gameHeader}
        {waitingList}
        {playingList}
    </div>

    function handlePlayerNameChange(event) {
        setPlayerName(event.target.value);
    }

    function handleStart() {
        const gameRef = push(gameListRef, {
                owner: dataSource.userId,
                playing: {[dataSource.userId]: {name: playerName, seat: 0}}
            });
        setConnected(true);
        setOwner(true);
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
        setOwner(false);
    }

    function handleWaitingChange(snapshot) {
        const newWaiting = snapshot.val();
        if (newWaiting === null) {
            return;
        }
        
        const oldEntries = Object.entries(waiting),
          newEntries = Object.entries(newWaiting);
        let hasChanged = newEntries.length !== oldEntries.length;
        for (let i = 0; i < newEntries.length && ! hasChanged; i++) {
            const [playerId, playerName] = newEntries[i],
                oldName = waiting[playerId];
            hasChanged = playerName !== oldName;
        }
        if (hasChanged) {
            setWaiting(newWaiting);
        }
    }

    function handleAllowClick(event) {
        const playerId = event.target.attributes['data-player'].value,
            playerName = waiting[playerId],
            playerRef = child(playingRef, playerId);
        let seat = 0;
        for (; seat < players.length; seat++) {
            if (players[seat].id === playerId) {
                break;
            }
        }
        set(playerRef, {name: playerName, seat: seat});
    }

    function handleMyPlayingChange(snapshot) {
        const dbPlaying = snapshot.val();
        if (dbPlaying === null) {
            return;
        }
        
        setPlaying(true);
    }

    function handlePlayingChange(snapshot) {
        const dbPlaying = snapshot.val();
        if (dbPlaying === null) {
            return;
        }
        
        const newPlayers = [],
            dbEntries = Object.entries(dbPlaying);
        let hasChanged = dbEntries.length !== players.length;
        for (const [playerId, playerInfo] of dbEntries) {
            const oldEntry = players[playerInfo.seat];
            newPlayers.push({id: playerId, name: playerInfo.name});
            hasChanged = (
                hasChanged ||
                playerId !== oldEntry.id ||
                playerInfo.name !== oldEntry.name);
        }

        if (hasChanged && props.onPlayersChange) {
            props.onPlayersChange(newPlayers);
        }
    }

    function handleDbCancel(error) {
        console.log(`Database subscription cancelled: ${error}`);
    }
}