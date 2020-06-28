import React from "react";
import { Paper, Typography } from "@material-ui/core";
import { useStyles } from "./styles";

interface CustomInfoProps {
	color: string;
	value: string;
	statType: string;
}
export default function CustomInfoFilled(props: CustomInfoProps) {
	const classes = useStyles();
	const { color, value, statType } = props;
	const colorVal = color;
	return (
		<div
			style={{
				backgroundColor: `${colorVal}`,
				width: 170,
				height: 195,
				marginBottom: 40,
				marginRight: 40,
				borderRadius: 3,
			}}
		>
			<Typography className={classes.value}>{value}</Typography>
			<hr style={{ width: 120, opacity: 0.5 }} />
			<Typography className={classes.statType}>{statType}</Typography>
		</div>
	);
}
