import { Button, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface CustomButtonProps {
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  value: string;
}
const ButtonFilled: React.FC<CustomButtonProps> = ({ handleClick, value }) => {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      size="medium"
      onClick={handleClick}
      className={classes.buttonFilled}
    >
      <Typography className={classes.valueField}>{value}</Typography>
    </Button>
  );
};

export default ButtonFilled;
