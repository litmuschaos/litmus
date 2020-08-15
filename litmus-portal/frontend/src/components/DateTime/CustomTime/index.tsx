import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import React from 'react';
import useStyles from './styles';

interface CustomTimeProps {
  ampm: boolean;
  disabled: boolean;
}

// Used to set and display time in hours and minutes
const CustomTime: React.FC<CustomTimeProps> = ({ ampm, disabled }) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(Date.now())
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <TimePicker
        className={classes.timePicker}
        ampm={ampm}
        disabled={disabled}
        inputVariant="outlined"
        inputProps={{
          style: {
            fontSize: '0.75rem',
            color: '#000000',
            paddingLeft: '1.8125rem',
            height: '0.425rem',
          },
          'aria-label': 'change-time',
        }}
        id="time-picker"
        variant="dialog"
        cancelLabel="Cancel"
        okLabel="Save"
        value={selectedDate}
        onChange={handleDateChange}
      />
    </MuiPickersUtilsProvider>
  );
};

export default CustomTime;
