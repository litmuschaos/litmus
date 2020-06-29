import React, { useState, useEffect } from "react";
import { Line } from "rc-progress";
import { colors } from "@material-ui/core";

export interface customProps {
	value: number | number[];
}

export default function LinearProgressBar(props: customProps) {
	const [color, setColor] = useState(" ");
	const width: number = 2;
	const resultValue = (props.value as number) * 10;
	useEffect(() => {
		if (resultValue <= 30) {
			return setColor("#CA2C2C");
		} else if (resultValue <= 60) {
			return setColor("#F6B92B");
		} else {
			return setColor("#109B67");
		}
	}, []);
	return (
		<div style={{ width: 150 }}>
			<Line
				percent={resultValue}
				strokeWidth={width}
				trailWidth={width}
				strokeColor={color}
			/>
		</div>
	);
}
