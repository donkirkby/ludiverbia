import './App.css';
import './WordGrid';
import WordGrid from './WordGrid';

function App(props) {
  return (
    <div className="App">
      <WordGrid dataSource={props.dataSource}/>
    </div>
  );
}

export default App;
