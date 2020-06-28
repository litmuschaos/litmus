import React from "react";
import { Button, Typography } from "@material-ui/core";
import { useStyles } from "./styles";

interface CustomButtonProps {
	handleClick: (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => void;
	value: string;
}
export default function ButtonFilled(props: CustomButtonProps) {
	const classes = useStyles();
	const { handleClick, value } = props;
	return (
		<Button
			variant="contained"
			size="medium"
			onClick={handleClick}
			className={classes.buttonFilled}
		>
			<Typography className={classes.valueField}>{value}</Typography>
		</Button>
	);
}
