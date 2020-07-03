import { Button, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface CustomButtonProps {
  isDisabled: boolean;
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  value: string;
}
const ButtonFilled: React.FC<CustomButtonProps> = ({
  isDisabled,
  handleClick,
  value,
}) => {
  const classes = useStyles();
  return (
    <Button
      variant="outlined"
      size="medium"
      disabled={isDisabled}
      onClick={handleClick}
      className={classes.buttonOutline}
    >
      <Typography className={classes.valueField}>{value}</Typography>
    </Button>
  );
};

export default ButtonFilled;
