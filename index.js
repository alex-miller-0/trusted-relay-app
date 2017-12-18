import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  Relayer,
} from './components';
import 'semantic-ui-css/semantic.min.css';
import Favicon from 'react-favicon';

render(
  <Provider store={store}>
    <Relayer />
  </Provider>, document.getElementById('app'));
