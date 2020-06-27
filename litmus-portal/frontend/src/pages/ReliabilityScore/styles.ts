import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		maxWidth: 980,
		marginTop: theme.spacing(8.75),
		marginLeft: theme.spacing(17.5),
		border: 1,
		borderColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: 3,
	},
	mainDiv: {
		paddingLeft: theme.spacing(3.75),
		paddingRight: theme.spacing(3.75),
		paddingTop: theme.spacing(3.75),
	},
	headerText: {
		marginTop: theme.spacing(1.25),
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	description: {
		width: 800,
		marginTop: theme.spacing(3.25),
		fontFamily: "Ubuntu",
		fontSize: 17,
	},
	testHeading: {
		marginTop: theme.spacing(6.25),
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	testInfo: {
		fontFamily: "Ubuntu",
		fontSize: 15,
		opacity: 0.4,
		width: 480,
	},
}));
