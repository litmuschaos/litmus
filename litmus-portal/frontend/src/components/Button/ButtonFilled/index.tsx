import Button from '@material-ui/core/Button';
import React from 'react';
import useStyles from './styles';

interface ButtonFilledProps {
  handleClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  children: React.ReactNode;
  isPrimary: boolean;
  isDisabled?: boolean;
  isNotElevated?: boolean;
  isTransparent?: boolean;
  styles?: Object;
  type?: any;
}
const ButtonFilled: React.FC<ButtonFilledProps> = ({
  handleClick,
  children,
  isPrimary,
  isDisabled,
  styles,
  type,
  isTransparent,
  isNotElevated,
}) => {
  const classes = useStyles();
  return (
    <Button
      style={styles}
      variant="contained"
      size="medium"
      disabled={isDisabled}
      type={type}
      onClick={handleClick}
      disableElevation={isNotElevated}
      className={
        isPrimary
          ? `${classes.button} ${classes.buttonPrimary}`
          : isTransparent
          ? `${classes.button} ${classes.buttonTransparent}`
          : `${classes.button} ${classes.buttonSecondary}`
      }
    >
      {children}
    </Button>
  );
};

export default ButtonFilled;
