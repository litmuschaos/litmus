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
	headingDiv: {
		display: "flex",
		flexDirection: "row",
	},
	createWorkflow: {
		[theme.breakpoints.down("md")]: {
			marginTop: theme.spacing(30),
			marginLeft: theme.spacing(-30),
		},
		[theme.breakpoints.down("sm")]: {
			marginTop: theme.spacing(30),
			marginLeft: theme.spacing(-30),
		},
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

	contentDiv: {
		display: "flex",
		flexDirection: "row",
		marginTop: theme.spacing(3.75),
	},
	statDiv: {
		width: "65%",
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		border: "border: 1px solid rgba(0, 0, 0, 0.05)",
		borderRadius: 3,
	},
	statsHeading: {
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: theme.spacing(3.75),
		paddingTop: theme.spacing(5),
		paddingLeft: theme.spacing(5),
	},
	quickActionDiv: {
		borderLeft: "1px solid rgba(0, 0, 0, 0.05)",
		paddingLeft: theme.spacing(5),
		marginLeft: theme.spacing(3),
		[theme.breakpoints.down("md")]: {
			marginTop: theme.spacing(40),
			marginLeft: theme.spacing(-20),
		},
		[theme.breakpoints.down("sm")]: {
			marginTop: theme.spacing(140),
			marginLeft: theme.spacing(-20),
		},
	},
	cardDiv: {
		display: "flex",
		flexDirection: "row",
		paddingLeft: theme.spacing(5),
		[theme.breakpoints.down("sm")]: {
			display: "flex",
			flexDirection: "column",
			marginTop: theme.spacing(5),
			marginLeft: theme.spacing(5),
		},
	},
}));
