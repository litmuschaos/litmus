import { FormControl, Select } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface SetTimeProps {
  handleChange: (
    event: React.ChangeEvent<{
      value: unknown;
    }>
  ) => void;
  value: number;
  minutes: number[];
}

// dropdown menu component for setting time
const SetTime: React.FC<SetTimeProps> = ({ handleChange, value, minutes }) => {
  const classes = useStyles();
  return (
    <div>
      <FormControl className={classes.formControlMonth}>
        <Select
          className={classes.select}
          disableUnderline
          value={value}
          onChange={handleChange}
          label="dates"
          inputProps={{
            name: 'dates',
            id: 'outlined-age-native-simple',
            style: {
              fontSize: '0.75rem',
              height: 7,
            },
          }}
        >
          {minutes.map((date) => (
            <option className={classes.opt} value={date}>
              {date}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
export default SetTime;
