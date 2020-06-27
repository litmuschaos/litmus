import React from "react";
import { Button } from "@material-ui/core";
import { useStyles } from "./styles";

interface CustomButtonProps {
	isDisabled: boolean;
	handleClick: (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => void;
	value: string;
}
export default function ButtonFilled(props: CustomButtonProps) {
	const classes = useStyles();
	const { isDisabled, handleClick, value } = props;
	return (
		<Button
			variant="outlined"
			size="medium"
			disabled={isDisabled}
			onClick={handleClick}
			className={classes.buttonOutline}
		>
			{value}
		</Button>
	);
}
