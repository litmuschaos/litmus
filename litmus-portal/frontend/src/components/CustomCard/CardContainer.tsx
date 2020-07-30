import React from 'react';
import useStyles from './styles';

const CardContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.card}>{children}</div>;
};

export default CardContainer;
