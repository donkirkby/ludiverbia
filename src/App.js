import './App.css';
import './WordGrid';
import WordGrid from './WordGrid';

function App(props) {
  return (
    <div className="App">
      <WordGrid dataSource={props.dataSource} confirmReset="yes"/>
    </div>
  );
}

export default App;
