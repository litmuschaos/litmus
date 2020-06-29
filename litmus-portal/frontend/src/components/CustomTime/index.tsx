import React from "react";
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

interface CustomProps {
	ampm: boolean;
}

export function CustomTime(props: CustomProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		new Date(Date.now())
	);
	const { ampm } = props;
	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<TimePicker
				ampm={ampm}
				style={{
					width: "5.375rem",
					height: "2.75rem",
					margin: 10,
				}}
				inputVariant="outlined"
				inputProps={{
					style: {
						fontSize: "0.75rem",
						color: "#000000",
						lineHeight: "0.875rem",
					},
				}}
				id="time-picker"
				variant="inline"
				value={selectedDate}
				onChange={handleDateChange}
			/>
		</MuiPickersUtilsProvider>
	);
}

export default CustomTime;
