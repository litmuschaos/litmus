import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
	drawer: {
		width: "100%",
		height: "100%",
	},
	drawerPaper: {
		//TODO: remove padding top
		paddingTop: theme.spacing(8),

		width: "100%",
		position: "relative",
	},
}));
