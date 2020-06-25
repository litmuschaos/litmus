import React from "react";
import { Button } from "@material-ui/core";
import { useStyles } from "./styles";

interface CustomButtonProps {
	handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	value: string;
}
export default function ButtonFilled(props: CustomButtonProps) {
	const classes = useStyles();
	const { handleClick, value } = props;
	return (
		<Button
			variant="outlined"
			size="medium"
			color="primary"
			onClick={handleClick}
			className={classes.buttonOutline}>
			{value}
		</Button>
	);
}
