import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	buttonFilled: {
		display: "inline",
		backgroundColor: theme.palette.secondary.dark,
		width: 110,
		height: 45,
		color: "#FFFFFF",
		"&:hover": {
			backgroundColor: theme.palette.secondary.dark,
		},
		marginRight: theme.spacing(2),
		marginLeft: theme.spacing(2),
	},
}));
