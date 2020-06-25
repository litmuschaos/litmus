import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	rootContainer: {
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	root: {
		marginTop: 70,
		marginLeft: 140,
		width: 400,
	},
	heading: {
		marginTop: 50,
		fontFamily: "Ubuntu",
		fontSize: 40,
	},
	description: {
		marginTop: 30,
		fontFamily: "Ubuntu",
		fontSize: 15,
	},
	inputArea: {
		marginTop: 30,
		display: "flex",
		textDecoration: "none",
		flexDirection: "column",
		paddingLeft: 16,
		paddingBottom: 18,
		borderRadius: 3,
		border: "1px solid #5B44BA",
		borderLeft: "3px solid #5B44BA",
	},
}));
