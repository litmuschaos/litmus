import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Config from "./config";
import App from "./containers/app/App";
import configureStore from "./redux/configureStore";
const { persistor, store } = configureStore();

const client = new ApolloClient({
	uri: Config.grahqlEndpoint,
});

export function ReduxRoot() {
	return (
		<ApolloProvider client={client}>
			<Provider store={store}>
				<PersistGate persistor={persistor}>
					<App />
				</PersistGate>
			</Provider>
		</ApolloProvider>
	);
}
