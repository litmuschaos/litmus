import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import React from 'react';
import useStyles from './styles';

interface CustomDateProps {
  disabled: boolean;
  selectedDate: Date | null;
  handleDateChange: (
    date: Date | null,
    value?: string | null | undefined
  ) => void;
}

// Used to set and display the date, month and year
const CustomDate: React.FC<CustomDateProps> = ({
  disabled,
  selectedDate,
  handleDateChange,
}) => {
  const classes = useStyles();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={classes.datePicker}
        autoOk
        format="dd/MM/yyyy"
        id="date-picker-inline"
        inputVariant="outlined"
        disablePast
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
