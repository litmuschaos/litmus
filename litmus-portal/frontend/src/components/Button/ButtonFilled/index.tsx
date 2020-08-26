import Button from '@material-ui/core/Button';
import React from 'react';
import useStyles from './styles';

interface ButtonFilledProps {
  handleClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  children: JSX.Element;
  isPrimary: boolean;
  isDisabled?: boolean;
  type?: any;
}
const ButtonFilled: React.FC<ButtonFilledProps> = ({
  handleClick,
  children,
  isPrimary,
  isDisabled,
  type,
}) => {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      size="medium"
      disabled={isDisabled}
      type={type}
      onClick={handleClick}
      className={isPrimary ? classes.buttonPrimary : classes.buttonSecondary}
    >
      {children}
    </Button>
  );
};

export default ButtonFilled;
