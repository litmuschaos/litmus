import { Button } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface ButtonOutlineProps {
  isDisabled: boolean;
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  styles?: Object;
  children?: React.ReactNode;
}
const ButtonOutline: React.FC<ButtonOutlineProps> = ({
  isDisabled,
  handleClick,
  styles,
  children,
}) => {
  const classes = useStyles();
  return (
    <Button
      style={styles}
      variant="outlined"
      size="medium"
      disabled={isDisabled}
      onClick={handleClick}
      className={classes.buttonOutline}
    >
      <div className={classes.valueField}>{children}</div>
    </Button>
  );
};

export default ButtonOutline;
