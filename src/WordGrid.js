import { set, ref } from '@firebase/database';
import React from 'react';

class WordGrid extends React.Component {
    constructor(props) {
        super(props);
        let startWord = props.startWord || '',
            midWord = props.midWord || '',
            endWord = props.endWord || '',
            newWord = props.newWord || '';
        this.state = {
            startWord: startWord.toUpperCase(),
            midWord: midWord.toUpperCase(),
            endWord: endWord.toUpperCase(),
            newWord: newWord,
            dataSource: props.dataSource
        };
        this.addField = React.createRef();
    }

    handleNewWordChange = event => {
        this.setState({newWord: event.target.value});
    };

    handleNewWordKeyPress = event => {
        if (event.key === 'Enter') {
            this.handleNewWord();
        }
    };

    handleNewWord = () => {
        const newWord = this.state.newWord.toUpperCase(),
            newState = {newWord: ''};
        if ( ! this.state.startWord) {
            newState.startWord = newWord;
        } else if ( ! this.state.endWord) {
            if (this.state.startWord < newWord) {
                newState.endWord = newWord;
            } else {
                newState.startWord = newWord;
                newState.endWord = this.state.startWord;
            }
        } else if ( ! this.state.midWord) {
            newState.midWord = newWord;
        } else if (newWord < this.state.midWord) {
            newState.midWord = newWord;
            newState.endWord = this.state.midWord;
        } else {
            newState.startWord = this.state.midWord;
            newState.midWord = newWord;
        }
        this.setState(newState);
        if (this.state.dataSource !== undefined) {
            if (this.state.dataSource.database === undefined) {
                console.warn("Undefined database!");
            } else {
                const singletonRef = ref(this.state.dataSource.database, 'singleton');
                set(singletonRef, newState);
            }
        }
        this.addField.current.focus();
    };

    render() {
        const newWord = this.state.newWord.toUpperCase(),
              canAdd = (
                  (newWord && ! this.state.endWord) ||
                  (this.state.startWord < newWord && newWord < this.state.endWord));
        let startBet = null,
            endBet = null;
        if (this.state.midWord)  {
            startBet = <button onClick={this.handleStartBet}>Bet Before</button>;
            endBet = <button onClick={this.handleEndBet}>Bet After</button>;
        }
        return <table className="WordGrid"><tbody>
            {(this.state.startWord &&
              <tr><td>{this.state.startWord}</td><td>{startBet}</td></tr>)||null}
            {(this.state.midWord &&
              <tr><td colspan="2">{this.state.midWord}</td></tr>)||null}
            {(this.state.endWord &&
              <tr><td>{this.state.endWord}</td><td>{endBet}</td></tr>)||null}
            <tr>
                <td><input
                    type="text"
                    placeholder="Type a word here."
                    value={this.state.newWord}
                    ref={this.addField}
                    autoFocus
                    onKeyPress={this.handleNewWordKeyPress}
                    onChange={this.handleNewWordChange}/>

                </td><td><button onClick={this.handleNewWord} disabled={ ! canAdd}>
                    Add
                </button></td>
            </tr>
        </tbody></table>;
    }
}

export default WordGrid;
