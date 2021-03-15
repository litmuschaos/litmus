import { IconButton, IconButtonProps, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

const BackButton: React.FC<IconButtonProps> = ({ onClick }) => {
  const classes = useStyles();
  return (
    <IconButton
      size="medium"
      className={classes.btn}
      onClick={onClick ?? (() => window.history.back())}
    >
      <img src="/icons/back.svg" alt="back" />
      <Typography className={classes.text}>Back</Typography>
    </IconButton>
  );
};

export default BackButton;
