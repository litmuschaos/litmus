// Material components
import { Typography } from "@material-ui/core";
import * as React from "react";
import { useStyles } from "./styles";

function ErrorPage() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Typography variant="h1">404</Typography>
			<Typography variant="h2">
				The page you are looking for isn’t here
			</Typography>
			<Typography variant="body1">
				You either tried some shady route or you came here by mistake.
				Whichever it is, try using the navigation or checkout some fancy
				links in the footer
			</Typography>
			<img
				alt="Under development"
				className={classes.image}
				src="/icons/litmus.svg"
			/>
		</div>
	);
}

export default ErrorPage;
