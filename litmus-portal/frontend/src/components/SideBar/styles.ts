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
	litmusDiv: {
		display: "flex",
		flexDirection: "row",
	},
	logo: {
		left: 35,
		padding: 0,
		position: "absolute",
		top:20
	},
	litmusHome: {
	
		width: 65,
		height: 30,
		fontWeight: "normal",
		fontFamily: "Ubuntu Condensed",
		fontStyle: "normal",
		fontSize: 26,
		left: 81,
		top: 24,
		position: "absolute",
		color: "#000000"	
	
	},
	drawerListItem: {
		display: "flex",
		height: 51,
		
		flexDirection: "row",
		"&:hover": {
			backgroundColor: "#858CDD",
			color: theme.palette.getContrastText(
			theme.palette.primary.contrastText)
		},
	},

	listIcon: {
		position: "absolute",
		left: "15.35%",
		right:"78.07%",
		alignSelf: "center"
	},
	listText: {
		position: "absolute",
		left: "30.7%",
		right: "28.95%",
		fontSize: 16,
		paddingBottom: 5,
		fontFamily: "Ubuntu",
		fontWeight: "normal",
		fontStyle: "normal"
		
	},
	drawerList: {
		
		top: 123,
		height: 267,
	},
		
}));
