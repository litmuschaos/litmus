import { Button, ButtonProps } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface ButtonOutlineProps extends ButtonProps {
  isDisabled?: boolean;
  handleClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  styles?: Object;
}
const ButtonOutline: React.FC<ButtonOutlineProps> = ({
  isDisabled,
  handleClick,
  styles,
  className,
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
      className={`${classes.buttonOutline} ${className}`}
    >
      <div className={classes.valueField}>{children}</div>
    </Button>
  );
};

export default ButtonOutline;
