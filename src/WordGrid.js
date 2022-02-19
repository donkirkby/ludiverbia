import { set, ref, child, onValue } from '@firebase/database';
import React, { useEffect, useState } from 'react';

export default function WordGrid(props) {
    const [startWord, setStartWord] = useState((props.startWord || '').toUpperCase()),
      [midWord, setMidWord] = useState((props.midWord || '').toUpperCase()),
      [endWord, setEndWord] = useState((props.endWord || '').toUpperCase()),
      [newWord, setNewWord] = useState(props.newWord || ''),
      gameId = props.gameId,
      dataSource = props.dataSource,
      confirmReset = props.confirmReset,
      halfabetRef = dataSource && dataSource.check() &&
        ref(dataSource.database, 'games/halfabet'),
      gameRef = halfabetRef && gameId && child(halfabetRef, gameId),
      wordRangeRef = gameRef && child(gameRef, `wordRange`),
      addField = React.createRef();

    useEffect(() => {
        if ( ! gameRef) {
            return;
        }
        
        const wordRangeOff = onValue(
                wordRangeRef,
                handleDatabaseWords,
                handleDbCancel);

        return () => {
            // Unsubscribe from database updates.
            if (wordRangeOff) {
                wordRangeOff();
            }
        };
    });

    function handleDatabaseWords(snapshot) {
        const wordInfo = snapshot.val();
        if (wordInfo === null) {
            return;
        }
        setStartWord(wordInfo.startWord);
        setMidWord(wordInfo.midWord);
        setEndWord(wordInfo.endWord);
    }

    function handleDbCancel(error) {
        console.error(error);
    }

    function handleNewWordChange(event) {
        setNewWord(event.target.value);
    }

    function handleNewWordKeyPress(event) {
        if (event.key === 'Enter') {
            handleNewWord();
        }
    }

    function handleNewWord() {
        const newWordDisplay = newWord && newWord.toUpperCase(),
            newState = {},
            saveState = {
                startWord: startWord,
                midWord: midWord,
                endWord: endWord
            };
        if ( ! startWord) {
            newState.startWord = newWordDisplay;
        } else if ( ! endWord) {
            if (startWord < newWordDisplay) {
                newState.endWord = newWordDisplay;
            } else {
                newState.startWord = newWordDisplay;
                newState.endWord = startWord;
            }
        } else if ( ! midWord) {
            newState.midWord = newWordDisplay;
        } else if (newWordDisplay < midWord) {
            newState.midWord = newWordDisplay;
            newState.endWord = midWord;
        } else {
            newState.startWord = midWord;
            newState.midWord = newWordDisplay;
        }
        Object.assign(saveState, newState);
        setNewWord('');
        setStartWord(saveState.startWord);
        setMidWord(saveState.midWord);
        setEndWord(saveState.endWord);
        if (wordRangeRef) {
            set(wordRangeRef, saveState);
        }
        addField.current.focus();
    }

    function handleStartBet() {
        reset();
    }

    function handleEndBet() {
        reset();
    }

    function reset() {
        if (confirmReset) {
            if ( ! window.confirm("Reset the game?")) {
                addField.current.focus();
                return;
            }
        }
        addField.current.focus();
        const newState = {startWord: "", midWord: "", endWord: ""};
        if (wordRangeRef) {
            set(wordRangeRef, newState);
        }
        setStartWord('');
        setMidWord('');
        setEndWord('');
        setNewWord('');
    }

    const newWordDisplay = newWord && newWord.toUpperCase(),
            canAdd = (
                (newWordDisplay && ! endWord) ||
                (startWord < newWordDisplay && newWordDisplay < endWord)),
            onKeyPress = (canAdd && handleNewWordKeyPress) || (() => {});
    let startBet = null,
        endBet = null;
    if (midWord)  {
        startBet = <button onClick={handleStartBet}>Bet Before</button>;
        endBet = <button onClick={handleEndBet}>Bet After</button>;
    }
    return <table className="WordGrid"><tbody>
        {(startWord &&
            <tr><td>{startWord}</td><td>{startBet}</td></tr>)||null}
        {(midWord &&
            <tr><td colSpan="2">{midWord}</td></tr>)||null}
        {(endWord &&
            <tr><td>{endWord}</td><td>{endBet}</td></tr>)||null}
        <tr>
            <td><input
                type="text"
                placeholder="Type a word here."
                value={newWord}
                ref={addField}
                autoFocus
                onKeyPress={onKeyPress}
                onChange={handleNewWordChange}/>

            </td><td><button onClick={handleNewWord} disabled={ ! canAdd}>
                Add
            </button></td>
        </tr>
    </tbody></table>;
}
