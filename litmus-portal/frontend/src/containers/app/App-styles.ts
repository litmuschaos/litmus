import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
	root: {
		width: "100vw",
		height: "100vh",
		zIndex: 1,
	},
	appFrame: {
		position: "relative",
		width: "100%",
		height: "100%",
		color: theme.palette.text.primary,
	},
	content: {
		backgroundColor: theme.palette.background.default,
		width: "100%",
	},
}));
