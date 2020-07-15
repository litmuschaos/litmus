import { Button, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface CustomButtonProps {
  isDisabled: boolean;
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: JSX.Element;
}
const ButtonOutline: React.FC<CustomButtonProps> = ({
  isDisabled,
  handleClick,
  children,
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
      <Typography className={classes.valueField}>{children}</Typography>
    </Button>
  );
};

export default ButtonOutline;
