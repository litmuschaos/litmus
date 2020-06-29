import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
	root: {
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		maxWidth: "61.25rem",
		marginTop: theme.spacing(8.75),
		marginLeft: theme.spacing(17.5),
		border: 1,
		borderColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: 3,
	},
	scHeader: {
		paddingLeft: theme.spacing(3.75),
		paddingRight: theme.spacing(3.75),
		paddingTop: theme.spacing(3.75),
		paddingBottom: theme.spacing(3.75),
	},
	headerText: {
		marginTop: theme.spacing(1.25),
		fontSize: "1.5625rem",
	},
	schBody: {
		width: "32.18rem",
		height: "3.375",
	},
	captionText: {
		marginLeft: theme.spacing(3.75),
		fontSize: "0.75rem",

		color: "rgba(0, 0, 0, 0.4)",
	},
	schLater: {
		marginLeft: theme.spacing(2.5),
	},
	radioText: {
		fontSize: "0.875rem",
	},
	description: {
		width: "32.18rem",
		marginTop: theme.spacing(3.25),
		marginBottom: theme.spacing(7.5),
		fontSize: "1.0625rem",
	},
	calIcon: {
		width: "7rem",
		height: "6.31rem",
		marginTop: theme.spacing(5),
		marginLeft: theme.spacing(25),
	},
	wtCaptionText: {
		color: "rgba(0, 0, 0, 0.4)",
	},

	schWithinTime: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},

	scFormControl: {
		marginLeft: theme.spacing(2.5),

		marginTop: theme.spacing(5),
		marginRight: theme.spacing(43.75),
	},

	scSegments: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-even",
	},
	scInnerSegments: {
		display: "flex",
		flexDirection: "column",
		marginTop: theme.spacing(1.25),
	},
	scparentRand: {
		display: "flex",
		flexDirection: "column",
	},
	scRandom: {
		display: "flex",
		flexDirection: "row",
		marginLeft: theme.spacing(1.625),
		height: "2.75rem",
		alignItems: "center",
	},
	wt: {},
	counterText: {
		width: "4.43rem",
		height: "2.75rem",
		border: "1px solid #D1D2D7",
		borderRadius: 3,
		fontSize: "1rem",
		marginLeft: theme.spacing(1.5),
		marginRight: theme.spacing(1.5),
		paddingLeft: theme.spacing(0.625),
		paddingTop: theme.spacing(0.375),
	},
	wtDateTime: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		width: "16rem",
		height: "3.375rem",
	},
	timeDate: {
		width: "4.2rem",
	},
	defInstance: {
		marginLeft: theme.spacing(0.25),
		marginTop: theme.spacing(2.25),
	},
	formControl: {
		marginLeft: theme.spacing(5),
	},
	wtDays: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		marginLeft: theme.spacing(7),
		marginTop: theme.spacing(1.25),
	},
	wtToggle: {
		margin: theme.spacing(1.25),
		width: "4.4375rem",
		height: "2.75rem",
		borderRadius: 3,
	},

	instButton: {
		width: "2.75rem",
		height: "2.75rem",
		border: "1px solid #D1D2D7",
		borderRadius: 3,

		fontSize: "0.75rem",
	},
	sub1: {
		margin: theme.spacing(1.875),
		color: "rgba(0, 0, 0)",
	},
	scRandsub1: {
		margin: theme.spacing(1.875),
	},
}));
