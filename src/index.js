import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import QuizlApp from './QuizlApp';
import AcrosticApp from './AcrosticApp';
import reportWebVitals from './reportWebVitals';
import DataSource from "./DataSource";

const dataSource = new DataSource();
dataSource.connect();
const pagePath = window.location.pathname.replace(/(\.html)?\/*$/, ''),
  pageName = pagePath.split('/').at(-1);
var app;
switch (pageName) {
  case 'acrostic':
    app = <AcrosticApp dataSource={dataSource}/>
    break;
  case '': // dev mode
  case 'quizl':
    app = <QuizlApp dataSource={dataSource}/>
    break;
  default:
    app = <App dataSource={dataSource}/>
}

ReactDOM.render(
  <React.StrictMode>
    {app}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
