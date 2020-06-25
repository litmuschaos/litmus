import React, { lazy, Suspense } from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { Loader } from "../../components";
import { history } from "../../redux/configureStore";
import withTheme from "../../theme";
import { useStyles } from "./App-styles";

const ErrorPage = lazy(() => import("../../pages/ErrorPage"));
const Workflows = lazy(() => import("../../pages/Workflows"));

function Routes() {
	const classes = useStyles();

	return (
		<div className={classes.content}>
			<Switch>
				<Route exact={true} path="/" component={Workflows} />
				<Route exact={true} path="/404" component={ErrorPage} />
				<Redirect to="/404" />
			</Switch>
		</div>
	);
}

function App() {
	const classes = useStyles();

	return (
		<Suspense fallback={<Loader />}>
			<Router history={history}>
				<div className={classes.root}>
					<div className={classes.appFrame}>
						{/* <Routes /> */}
						<Routes />
					</div>
				</div>
			</Router>
		</Suspense>
	);
}

export default withTheme(App);
