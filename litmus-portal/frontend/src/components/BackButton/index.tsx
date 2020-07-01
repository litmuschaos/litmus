import { IconButton } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBackTwoTone';
import React from 'react';
import { history } from '../../redux/configureStore';
import useStyles from './styles';

interface BackButtonProps {
  path: string;
}

const BackButton: React.FC<BackButtonProps> = ({ path }) => {
  const classes = useStyles();
  return (
    <div className={classes.ring}>
      <IconButton className={classes.button} onClick={() => history.push(path)}>
        <ArrowBack />
      </IconButton>
    </div>
  );
};

export default BackButton;
