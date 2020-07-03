import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react';
import useStyles from './styles';

interface CustomDateProps {
  disabled: boolean;
}

// Used to set and display the date, month and year
const CustomDate: React.FC<CustomDateProps> = ({ disabled }) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(Date.now())
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={classes.datePicker}
        autoOk
        variant="inline"
        format="dd/MM/yyyy"
        id="date-picker-inline"
        inputVariant="outlined"
        disabled={disabled}
        value={selectedDate}
        inputProps={{
          style: {
            fontSize: '0.8125rem',
            color: '#000000',
            lineHeight: '0.875rem',
          },
        }}
        InputAdornmentProps={{ position: 'end' }}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default CustomDate;
