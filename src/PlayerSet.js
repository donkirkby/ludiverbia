import { useState, useEffect } from 'react';
import { ref, child, push, set, onValue, remove } from "firebase/database";

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
    const [newGameId, setNewGameId] = useState(props.gameId || ''),
        [playerName, setPlayerName] = useState(''),
        [isConnected, setConnected] = useState(false),
        [isOwner, setOwner] = useState(false),
        [isPlaying, setPlaying] = useState(false),
        [waiting, setWaiting] = useState({}),
        dataSource = props.dataSource,
        players = props.players || [],
        gameId = props.gameId || newGameId,
        gameListRef = dataSource && dataSource.check() && props.gameType &&
          ref(dataSource.database, 'games/' + props.gameType),
        gameRef = isConnected && gameListRef && child(gameListRef, gameId),
        waitingRef = gameRef && child(gameRef, 'waiting'),
        playingRef = gameRef && child(gameRef, 'playing'),
        gameHeader = isConnected
            ? <div>
                <p>Game id: {gameId}</p>
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
                <input
                    type="text"
                    className="input is-large"
                    placeholder="Game id (if joining)"
                    value={newGameId}
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
                <button
                    type="button"
                    onClick={handleJoin}
                    disabled={
                        isConnected ||
                        ! (newGameId && playerName && gameListRef)}
                    className="button is-large is-primary m-1">Join</button>
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
    
    return <div className="tile is-child notification is-light">
        {gameHeader}
        {waitingList}
    </div>

    function handlePlayerNameChange(event) {
        setPlayerName(event.target.value);
    }

    function handleStart() {
        const gameRef = push(gameListRef, {
                owner: dataSource.userId,
                startDate: new Date().toISOString(),
                playing: {[dataSource.userId]: {name: playerName, seat: 0}}
            });
        setConnected(true);
        setOwner(true);
        props.onGameIdChange(gameRef.key);
    }

    function handleGameIdChange(event) {
        setNewGameId(event.target.value);
    }

    function handleGameIdKeyPress() {

    }

    function handleJoin() {
        const gameRef = child(gameListRef, newGameId),
            waitingRef = child(gameRef, 'waiting'),
            playerRef = child(waitingRef, dataSource.userId);
        set(playerRef, playerName);
        setConnected(true);
    }

    function handleLeave() {
        props.onGameIdChange('');
        setConnected(false);
        setOwner(false);
        setWaiting(false);
    }

    function handleWaitingChange(snapshot) {
        const newWaiting = snapshot.val() || {},
          oldEntries = Object.entries(waiting),
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
            waiterRef = child(waitingRef, playerId),
            playerRef = child(playingRef, playerId);
        let seat = 0;
        for (; seat < players.length; seat++) {
            if (players[seat].id === playerId) {
                break;
            }
        }
        set(playerRef, {name: playerName, seat: seat});
        remove(waiterRef);
    }

    function handleMyPlayingChange(snapshot) {
        const dbPlaying = snapshot.val();
        if (dbPlaying === null) {
            return;
        }
        
        setPlaying(true);
        if (newGameId) {
            props.onGameIdChange(newGameId);
        }
        setNewGameId('');
    }

    function handlePlayingChange(snapshot) {
        const playerId = dataSource.check() && dataSource.userId,
            newPlayers = buildPlayers(snapshot.val(), players, playerId);

        if (newPlayers && props.onPlayersChange) {
            props.onPlayersChange(newPlayers);
        }
    }

    function handleDbCancel(error) {
        console.log(`Database subscription cancelled: ${error}`);
    }
}

export function buildPlayers(dbData, oldPlayers, playerId) {
    const dbEntries = (dbData && Object.entries(dbData)) || [],
        newPlayers = [];
    dbEntries.sort((a, b) => (a[1].seat - b[1].seat));
    for (let i = 0; i < dbEntries.length; i++) {
        if (dbEntries[0][0] === playerId) {
            break;
        }
        dbEntries.push(dbEntries.shift());
    }
    let isChanged = dbEntries.length !== oldPlayers.length;
    for (let i = 0; i < dbEntries.length; i++) {
        const oldPlayer = oldPlayers[i],
            entry = dbEntries[i],
            newPlayer = Object.assign({id: entry[0]}, entry[1]);
        if ( ! isChanged) {
            const oldPlayerEntries = Object.entries(oldPlayer),
                newPlayerEntries = Object.entries(newPlayer);
            if (isChanged || oldPlayerEntries.length !== newPlayerEntries.length) {
                isChanged = true;
            }
            else {
                for (let j = 0; j < oldPlayerEntries.length; j++) {
                    const [fieldName, oldValue] = oldPlayerEntries[j],
                        newValue = newPlayer[fieldName];
                    if (newValue !== oldValue) {
                        isChanged = true;
                        break;
                    }
                }
            }
        }
        newPlayers.push(newPlayer);
    }
    if (isChanged) {
        return newPlayers;
    }
}