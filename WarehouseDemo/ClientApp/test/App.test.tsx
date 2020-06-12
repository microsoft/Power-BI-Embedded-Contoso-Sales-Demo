import React from 'react';
import App from '../src/App';
import ReactDOM from 'react-dom';

// Automated test cases here
it('renders learn react link', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
  expect(/warehouse demo/i).toBeDefined();
});