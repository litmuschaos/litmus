import React from 'react';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

interface CustomTimeProps {
  ampm: boolean;
  disabled: boolean;
}

// Used to set and display time in hours and minutes
const CustomTime: React.FC<CustomTimeProps> = ({ ampm, disabled }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(Date.now())
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <TimePicker
        ampm={ampm}
        disabled={disabled}
        style={{
          width: '5.375rem',
          height: '2.75rem',
          margin: 10,
        }}
        inputVariant="outlined"
        inputProps={{
          style: {
            fontSize: '0.75rem',
            color: '#000000',
            lineHeight: '0.875rem',
          },
        }}
        id="time-picker"
        variant="inline"
        value={selectedDate}
        onChange={handleDateChange}
      />
    </MuiPickersUtilsProvider>
  );
};

export default CustomTime;
