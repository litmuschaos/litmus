import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
	drawer: {
		width: "100%",
		height: "100%",
	},
	drawerPaper: {
		//TODO: remove padding top
	

		width: "100%",
		position: "relative",
	},
	litmusDiv: {
		display: "flex",
		flexDirection: "row",
		marginTop: theme.spacing(3.5),
		marginLeft: theme.spacing(4)
	},
	logo: {
		left: 35,
		
		
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
		marginLeft: theme.spacing(1.75),
		color: "#000000"	
	
	},
	drawerListItem: {
		display: "flex",
		height: 51,
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		"&:hover": {
			backgroundColor: "#858CDD",
			color: theme.palette.getContrastText(
			theme.palette.primary.contrastText)
		},
	},

	listIcon: {
		
		paddingLeft: theme.spacing(2),
		alignSelf: "center"
	},
	listText: {
	
		marginLeft: theme.spacing(0),
		fontSize: 16,
		
		fontFamily: "Ubuntu",
		fontWeight: "normal",
		fontStyle: "normal"
		
	},
	drawerList: {
		
		marginTop: theme.spacing(8),
		height: 267,
		
	},
		
}));
