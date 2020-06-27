import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	testHeading: {
		marginTop: theme.spacing(6.25),
		fontFamily: "Ubuntu",
		fontSize: 25,
	},
	testType: {
		fontSize: 17,
		fontFamily: "Ubuntu",
		paddingRight: theme.spacing(1.25),
	},
	testResult: {
		color: "#109B67",
		fontSize: 17,
		fontFamily: "Ubuntu",
		paddingLeft: theme.spacing(1.25),
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
		paddingLeft: theme.spacing(12.5),
	},
	table: {
		marginTop: 50,
		width: 950,
		alignItems: "center",
	},
	tableHeader: {
		width: 800,
		marginTop: theme.spacing(7.5),
	},
	headingModal: {
		marginTop: theme.spacing(1.25),
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
	buttonDiv: {
		width: 600,
		marginTop: theme.spacing(5),
		marginLeft: theme.spacing(56),
	},
}));
