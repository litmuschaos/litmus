import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	rootContainer: {
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	root: {
		marginTop: theme.spacing(8.75),
		marginLeft: theme.spacing(17.5),
		width: 400,
	},
	heading: {
		marginTop: theme.spacing(6.2),
		fontFamily: "Ubuntu",
		fontSize: theme.spacing(5),
	},
	description: {
		marginTop: theme.spacing(3.75),
		fontFamily: "Ubuntu",
		fontSize: 15,
	},
	inputArea: {
		marginTop: theme.spacing(3.75),
		display: "flex",
		textDecoration: "none",
		flexDirection: "column",
		paddingLeft: theme.spacing(2),
		paddingBottom: theme.spacing(2.2),
		borderRadius: 3,
		border: "1px solid #5B44BA",
		borderLeft: "3px solid #5B44BA",
	},
	loginDiv: {
		marginTop: theme.spacing(5),
		marginLeft: theme.spacing(-2),
	},
	forgotPasssword: {
		marginTop: 25,
		marginBottom: 30,
	},
}));
