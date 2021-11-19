import { Switch } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface SwitchButtonProps {
  checked: boolean;
  handleChange: () => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  checked,
  handleChange,
}) => {
  const classes = useStyles();
  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      inputProps={{ 'aria-label': 'controlled' }}
      className={classes.root}
    />
  );
};

export default SwitchButton;
