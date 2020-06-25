import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	buttonFilled: {
		marginRight: 50,
		display: "inline",
		backgroundColor: "#5B44BA",
		width: 110,
		height: 45,
		"&:hover": {
			backgroundColor: "#5B44BA",
		},
	},
}));
