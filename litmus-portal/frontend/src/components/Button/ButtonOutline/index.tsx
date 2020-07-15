import { Button } from '@material-ui/core';
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
      <div className={classes.valueField}>{children}</div>
    </Button>
  );
};

export default ButtonOutline;
