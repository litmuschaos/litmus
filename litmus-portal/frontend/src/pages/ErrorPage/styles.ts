import { makeStyles } from "@material-ui/core/styles";

// Component styles
export const useStyles = makeStyles((theme) => ({
	root: {
		height: "100%",
		textAlign: "center",
		padding: theme.spacing(4),
		marginTop: theme.spacing(6),
		color: theme.palette.text.secondary,
		fontSize: 18,
	},
	image: {
		marginTop: theme.spacing(6),
		width: 150,
		color: theme.palette.secondary.main,
	},
}));
