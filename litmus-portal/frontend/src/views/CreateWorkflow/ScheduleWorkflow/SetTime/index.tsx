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
  data: number[];
}

// dropdown menu component for setting time
const SetTime: React.FC<SetTimeProps> = ({ handleChange, value, data }) => {
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
            style: {
              fontSize: '0.75rem',
            },
          }}
          MenuProps={{ classes: { paper: classes.menuPaper } }}
        >
          {data.map((dataValue) => (
            <option key={dataValue} className={classes.opt} value={dataValue}>
              {dataValue}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
export default SetTime;
