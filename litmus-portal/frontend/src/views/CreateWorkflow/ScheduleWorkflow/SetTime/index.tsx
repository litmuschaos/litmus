import { FormControl, MenuItem, Select } from '@material-ui/core';
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

// dropdown menu component for setting time
const SetTime: React.FC<SetTimeProps> = ({ handleChange, value, data }) => {
  const classes = useStyles();
  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          displayEmpty
          value={value}
          disableUnderline
          className={classes.select}
          onChange={handleChange}
          MenuProps={MenuProps}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          {data.map((dataValue) => (
            <MenuItem key={dataValue} className={classes.opt} value={dataValue}>
              {dataValue}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
export default SetTime;
