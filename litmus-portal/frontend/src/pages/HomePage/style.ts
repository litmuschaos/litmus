import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	rootContainer: {
		height: "100vh",
		display: "flex",
		fontFamily: "Ubuntu",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	userName: {
		fontFamily: "Ubuntu",
		fontSize: 40,
		marginBottom: 30,
	},
	createWorkflowCard: {
		width: 230,
		height: 240,
		border: "1px solid #5B44BA",
		borderRadius: 3,
		boxShadow: "2px 1px 9px rgba(91, 68, 186, 0.25)",
	},
	createWorkflowHeading: {
		fontFamily: "Ubuntu",
		fontSize: 15,
		marginLeft: 30,
		paddingTop: 40,
	},
	createWorkflowTitle: {
		fontFamily: "Ubuntu",
		fontSize: 25,
		color: "#5B44BA",
		fontWeight: "bold",
		marginLeft: 30,
		marginTop: 20,
	},
	quickActionCard: {
		fontFamily: "Ubuntu",
		fontSize: 18,
	},
	listItem: {
		color: "#000",
		paddingLeft: 20,
		paddingBottom: 2,
		textDecoration: "none",
	},
	listItems: {
		marginTop: 20,
	},
	mainHeading: {
		color: "#109B67",
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: 5,
	},
	mainResult: {
		color: "#000",
		fontFamily: "Ubuntu",
		fontSize: 25,
		marginBottom: 25,
	},
	mainDesc: {
		color: "#000",
		fontFamily: "Ubuntu",
		fontSize: 18,
	},
}));
