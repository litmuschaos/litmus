import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
	ring: {
		width: 45,
		height: 45,
		borderRadius: "50%",
		borderWidth: 4,
		borderStyle: "solid",
		borderColor: theme.palette.primary.contrastText,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
	},
	button: {
		color: theme.palette.primary.contrastText,
	},
}));
