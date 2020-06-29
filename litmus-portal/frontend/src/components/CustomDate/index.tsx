import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import React from "react";

const CustomDate = () => {
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		new Date(Date.now())
	);

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<KeyboardDatePicker
				autoOk
				variant="inline"
				format="dd/MM/yyyy"
				id="date-picker-inline"
				inputVariant="outlined"
				value={selectedDate}
				style={{
					width: "9.875rem",
					height: "2.75rem",
					margin: 10,
				}}
				inputProps={{
					style: {
						fontSize: "0.8125rem",
						color: "#000000",
						lineHeight: "0.875rem",
					},
				}}
				InputAdornmentProps={{ position: "end" }}
				onChange={handleDateChange}
				KeyboardButtonProps={{
					"aria-label": "change date",
				}}
			/>
		</MuiPickersUtilsProvider>
	);
};

export default CustomDate;
