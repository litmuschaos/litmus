import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
	value: {
		textAlign: "center",
		paddingTop: theme.spacing(5),
		fontFamily: "Ubuntu",
		fontSize: "2.5rem",
		color: theme.palette.common.white,
		fontWeight: 500,
	},
	statType: {
		textAlign: "center",
		fontSize: "1.125rem",
		color: theme.palette.common.white,
	},
}));
