import { createBrowserHistory } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import * as localforage from 'localforage';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const persistConfig: PersistConfig<any> = {
  key: 'root',
  version: 1,
  storage: localforage,
  blacklist: [],
};

const history = createBrowserHistory();

const dev = process.env.NODE_ENV === 'development';

let middleware = applyMiddleware(thunk);

if (dev) {
  middleware = composeWithDevTools(middleware);
}

const persistedReducer = persistReducer(persistConfig, rootReducer());

export default () => {
  const store = createStore(persistedReducer, {}, middleware) as any;
  const persistor = persistStore(store);
  return { store, persistor };
};

export { history };
