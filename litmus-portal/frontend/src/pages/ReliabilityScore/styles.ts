import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	rootContainer: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#E5E5E5",
	},
	root: {
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		width: 980,
		marginTop: 70,
		marginLeft: 140,
		border: 1,
		borderColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: 3,
	},
	heading: {
		marginTop: 50,
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	description: {
		width: 800,
		marginTop: 26,
		fontFamily: "Ubuntu",
		fontSize: 17,
	},
	testHeading: {
		marginTop: 50,
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	testType: {
		fontSize: 17,
		fontFamily: "Ubuntu",
		paddingRight: 10,
	},
	testResult: {
		color: "#109B67",
		fontSize: 17,
		fontFamily: "Ubuntu",
		paddingLeft: 10,
	},
	modal: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	paper: {
		minWidth: 981,
		minHeight: 700,
		backgroundColor: theme.palette.background.paper,
		border: "2px solid #000",
		boxShadow: theme.shadows[5],
		paddingLeft: 100,
	},
	table: {
		marginTop: 50,
		width: 950,
		alignItems: "center",
	},
	headingModal: {
		marginTop: 10,
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	tableHeading: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#000000",
		opacity: 0.6,
	},
	tableData: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#000000",
		fontWeight: "bold",
	},
	tableWeight: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#109B67",
		fontWeight: "bold",
	},
	tablePoints: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#000000",
		fontWeight: "bold",
	},
	tableResult: {
		color: "#109B67",
		fontSize: 18,
		fontFamily: "Ubuntu",
	},
	testInfo: {
		fontFamily: "Ubuntu",
		fontSize: 15,
		opacity: 0.4,
		width: 480,
	},
}));
