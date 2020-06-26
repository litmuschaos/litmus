import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	buttonFilled: {
		display: "inline",
		backgroundColor: "#5B44BA",
		width: 110,
		height: 45,
		color: "#FFFFFF",
		"&:hover": {
			backgroundColor: "#5B44BA",
		},
		marginRight: theme.spacing(2),
		marginLeft: theme.spacing(2),
	},
}));
