import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	buttonFilled: {
		display: "inline",
		backgroundColor: theme.palette.secondary.dark,
		width: "6.875rem",
		height: "2.8125rem",
		color: theme.palette.common.white,
		"&:hover": {
			backgroundColor: theme.palette.secondary.dark,
		},
		marginRight: theme.spacing(2),
		marginLeft: theme.spacing(2),
	},
	valueField: {
		fontSize: "0.75rem",
	},
}));
