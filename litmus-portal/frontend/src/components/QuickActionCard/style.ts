import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	quickActionCard: {
		fontFamily: "Ubuntu",
		fontSize: 18,
	},
	listItem: {
		color: "#000",
		paddingLeft: theme.spacing(2.5),
		paddingBottom: theme.spacing(0.25),
		textDecoration: "none",
	},
	listItems: {
		marginTop: theme.spacing(2.5),
	},
}));
