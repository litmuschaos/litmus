import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	buttonOutline: {
		display: "flex",
		flexDirection: "row",
		minWidth: 70,
		height: 45,
		border: "1px solid #5B44BA",
		marginRight: theme.spacing(2),
		marginLeft: theme.spacing(2),
	},
}));
