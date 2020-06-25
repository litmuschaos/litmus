import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import { useStyles } from "./styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Image from "../../icons/arrow.png";
const PrettoSlider = withStyles({
	root: {
		backgroundColor: "null",
		height: 8,
	},
	track: {
		background:
			"linear-gradient(90deg, #5B44BA 0%, #858CDD 49.48%, #109B67 100%)",
		height: 38,
		borderRadius: 4,
		borderTopRightRadius: 20,
		borderBottomRightRadius: 20,
	},
	rail: {
		height: 38,
		background: "#C9C9CA",
		borderRadius: 4,
	},
	mark: {
		backgroundSize: "cover",
		height: 40,
		width: 10,
		marginTop: -2,
	},
	markActive: {
		opacity: 1,
	},
})(Slider);

const marks = [
	{
		value: 1,
	},
	{
		value: 2,
	},
	{
		value: 3,
	},
	{
		value: 4,
	},
	{
		value: 5,
	},
	{
		value: 6,
	},
	{
		value: 7,
	},
	{
		value: 8,
	},
	{
		value: 9,
	},
];

const theme = createMuiTheme({
	overrides: {
		MuiSlider: {
			thumb: {
				opacity: 0,
			},
			mark: {
				backgroundImage: `url(${Image})`,
				backgroundColor: "none",
			},
			markActive: {
				backgroundImage: `url(${Image})`,
				backgroundColor: "none",
			},
		},
	},
});

interface customSliderProps {
	testName: string;
	value: number;
	onChangeCommitted: (event: object, value: number | number[]) => void;
}

const CustomSlider = (props: customSliderProps) => {
	const value = props.value;
	const onChangeCommitted = props.onChangeCommitted;
	const classes = useStyles();
	return (
		<ThemeProvider theme={theme}>
			<div className="App">
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						marginTop: 50,
					}}>
					<Typography className={classes.testType}>{props.testName}</Typography>
					<Typography>-</Typography>
					<Typography className={classes.testResult}>{value} points</Typography>
				</div>
				<div style={{ width: 900, marginBottom: 30 }}>
					<PrettoSlider
						defaultValue={value}
						aria-labelledby="discrete-slider-small-steps"
						step={1}
						aria-label="pretto slider"
						max={10}
						valueLabelDisplay="auto"
						marks={marks}
						onChange={onChangeCommitted}
					/>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default CustomSlider;
