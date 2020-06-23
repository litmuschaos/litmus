import { createBrowserHistory } from "history";
import * as localforage from "localforage";
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import { PersistConfig, persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const persistConfig: PersistConfig<any> = {
	key: "root",
	version: 1,
	storage: localforage,
	blacklist: [],
};

const logger = (createLogger as any)();
const history = createBrowserHistory();

const dev = process.env.NODE_ENV === "development";

let middleware = dev ? applyMiddleware(thunk, logger) : applyMiddleware(thunk);

if (dev) {
	middleware = composeWithDevTools(middleware);
}

const persistedReducer = persistReducer(persistConfig, rootReducer(history));

export default () => {
	const store = createStore(persistedReducer, {}, middleware) as any;
	const persistor = persistStore(store);
	return { store, persistor };
};

export { history };
