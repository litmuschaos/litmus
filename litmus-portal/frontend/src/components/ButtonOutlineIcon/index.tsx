import React from 'react';
import { Button, Typography } from '@material-ui/core';
import useStyles from './styles';

interface ButtonOutlineIconProps {
  isDisabled: boolean;
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: JSX.Element;
}
const ButtonOutlineIcon: React.FC<ButtonOutlineIconProps> = ({
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
export default ButtonOutlineIcon;
