import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
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
}));
