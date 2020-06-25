import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useStyles } from "./styles";

export function Header() {
	const classes = useStyles();

	return (
		<AppBar position="relative" className={classes.appBar}>
			<Toolbar>
				<Typography variant="h6" noWrap>
					Litmus Portal
				</Typography>
			</Toolbar>
		</AppBar>
	);
}
