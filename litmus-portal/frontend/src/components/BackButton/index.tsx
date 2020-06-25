import { IconButton } from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBackTwoTone";
import React from "react";
import { history } from "../../redux/configureStore";
import { useStyles } from "./styles";

export function BackButton(props: { path: string }) {
	const classes = useStyles();
	return (
		<div className={classes.ring}>
			<IconButton
				className={classes.button}
				onClick={() => history.push(props.path)}
			>
				<ArrowBack />
			</IconButton>
		</div>
	);
}
