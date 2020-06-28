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
		width: 1050,
		height: 800,
		backgroundColor: theme.palette.background.paper,
		paddingLeft: theme.spacing(6),
		paddingRight: theme.spacing(6),
		outline: "none",
		borderRadius: 3,
	},
	table: {
		marginTop: theme.spacing(4),
		width: 950,
		alignItems: "center",
		border: "1px solid #E5E5E5",
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
		marginTop: theme.spacing(5),
		marginLeft: theme.spacing(48),
	},
	resultDiv: {
		display: "flex",
		flexDirection: "column",
		marginRight: 70,
	},
	resultText: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#000000",
		opacity: 0.6,
		width: 140,
	},
	resultTextInfo: {
		fontFamily: "Ubuntu",
		fontSize: 18,
		color: "#000000",
		opacity: 0.6,
		width: 250,
	},
	totalScore: {
		fontFamily: "Ubuntu",
		fontSize: 36,
		color: "#F6B92B",
	},
	reliabilityScore: {
		fontFamily: "Ubuntu",
		fontSize: 36,
		color: "#858CDD",
	},
	testTips: {
		width: 450,
		height: 65,
		fontSize: 14,
		fontFamily: "Ubuntu",
	},
}));
