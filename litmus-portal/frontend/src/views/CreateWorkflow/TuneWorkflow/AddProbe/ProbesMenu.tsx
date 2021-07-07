import { InputLabel, MenuItem, Select } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface ProbesMenuProps {
  id: string;
  label: string;
  value: string;
  handleChange: (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
  valueList: string[];
}

const ProbesMenu: React.FC<ProbesMenuProps> = ({
  id,
  label,
  value,
  handleChange,
  valueList,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.inputFormField}>
      <InputLabel className={classes.formLabel} htmlFor={id}>
        {label}
      </InputLabel>
      <Select
        value={value}
        className={classes.inputSelect}
        variant="outlined"
        onChange={handleChange}
        inputProps={{
          id,
          name: id,
        }}
      >
        {valueList.map((compData) => {
          return (
            <MenuItem key={compData} value={compData}>
              {compData}
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};

export default ProbesMenu;
