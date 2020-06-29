import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	quickActionCard: {
		fontSize: "1.125rem",
	},
	listItem: {
		color: theme.palette.common.black,
		paddingLeft: theme.spacing(2.5),
		paddingBottom: theme.spacing(0.25),
		textDecoration: "none",
	},
	listItems: {
		marginTop: theme.spacing(2.5),
	},
	mainHeader: {
		fontSize: "1.0625rem",
		color: theme.palette.common.black,
	},
}));
