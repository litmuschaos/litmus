import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	rootContainer: {
		height: "100vh",
		display: "flex",
		fontFamily: "Ubuntu",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	root: {
		marginTop: theme.spacing(3),
		marginLeft: theme.spacing(10),
	},
	mainDiv: {
		marginLeft: theme.spacing(3.75),
		width: 600,
	},
	userName: {
		fontFamily: "Ubuntu",
		fontSize: 40,
		marginBottom: theme.spacing(3.75),
	},
	createWorkflowCard: {
		width: 230,
		border: "1px solid #5B44BA",
		borderRadius: 3,
		marginLeft: theme.spacing(10),
		boxShadow: "2px 1px 9px rgba(91, 68, 186, 0.25)",
	},
	createWorkflowHeading: {
		fontFamily: "Ubuntu",
		fontSize: 15,
		marginLeft: theme.spacing(3.75),
		paddingTop: theme.spacing(5),
	},
	createWorkflowTitle: {
		fontFamily: "Ubuntu",
		fontSize: 25,
		color: "#5B44BA",
		fontWeight: "bold",
		marginLeft: theme.spacing(3.75),
		marginTop: theme.spacing(2.5),
	},
	arrowForwardIcon: {
		color: "#5B44BA",
		marginLeft: theme.spacing(22.5),
		marginTop: theme.spacing(4.375),
		marginBottom: theme.spacing(2.5),
	},
	mainHeading: {
		color: "#109B67",
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: theme.spacing(0.625),
	},
	mainResult: {
		color: "#000",
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: theme.spacing(3.125),
	},
	mainDesc: {
		color: "#000",
		fontFamily: "Ubuntu",
		fontSize: 18,
	},

	statsDiv: {
		display: "flex",
		flexDirection: "row",
		marginTop: theme.spacing(3.75),
	},
	statsHeading: {
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: theme.spacing(3.75),
	},
	quickActionDiv: {
		marginLeft: theme.spacing(10),
	},
}));
