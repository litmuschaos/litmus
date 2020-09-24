import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
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
        format="dd/MM/yyyy"
        id="date-picker-inline"
        inputVariant="outlined"
        disabled={disabled}
        cancelLabel="Cancel"
        okLabel="Save"
        variant="dialog"
        value={selectedDate}
        inputProps={{
          style: {
            fontSize: '0.75rem',
            color: '#000000',
            lineHeight: '0.875rem',
            height: '0.425rem',
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
