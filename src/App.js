import './App.css';
import './WordGrid';
import WordGrid from './WordGrid';

function App() {
  return (
    <div className="App">
      <div className="title">Halfabet</div>
      <p>The players take turns adding words to the list. After the first two
        words, all words must be between the two outermost words,
        alphabetically. Whenever you add a fourth word, it stays in the game,
        along with the words before it and after it. The other word gets
        removed. All words must be regular words in an English dictionary: no
        proper nouns or foreign words.</p>
      <p>Instead of adding a word, you can bet that your opponent can't find a
        word between two of the current words. Click on one of the bet buttons
        to show which gap they need to fill in.</p>
      <WordGrid/>
    </div>
  );
}

export default App;
