import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";

interface CustomButtonProps {
	label: string;
}
export default function ToggleButtonSizes(props: CustomButtonProps) {
	const [alignment, setAlignment] = React.useState("left");
	const { label } = props;
	const handleChange = (
		event: React.MouseEvent<HTMLElement>,
		newAlignment: string
	) => {
		setAlignment(newAlignment);
	};

	return (
		<ToggleButton
			value="sun"
			aria-label="sun"
			style={{
				margin: 10,
				width: "4.4375rem",
				height: "2.75rem",
				fontWeight: "normal",
				border: "1px solid #D1D2D7",
				borderRadius: 3,
				color: "#000000",
			}}
		>
			{label}
		</ToggleButton>
	);
}
