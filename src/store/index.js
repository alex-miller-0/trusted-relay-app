import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import tokens from './tokens';

const composeEnhancers = process.env.NODE_ENV !== 'production' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  : compose;

const preloadedState = window.__PRELOADED_STATE__;

delete window.__PRELOADED_STATE__;

const rootReducer = combineReducers({
  tokens,
});

const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(
    applyMiddleware(thunk)
  )
);

export default store;