import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface MainInfoContainerProps {
  src: string;
  alt: string;
  heading: string;
  description: string;
  button: React.ReactNode;
  link?: React.ReactNode;
}

const MainInfoContainer: React.FC<MainInfoContainerProps> = ({
  src,
  alt,
  heading,
  description,
  button,
  link,
}) => {
  const classes = useStyles();
  return (
    <div>
      {/* First Agent Deployment Container */}
      <Paper className={classes.mainContainer}>
        <img src={src} alt={alt} />
        <div className={classes.containerDesc}>
          <Typography id="Heading">{heading}</Typography>
          <Typography id="desc">{description}</Typography>
          <div className={classes.buttonGroup}>
            {button}
            {link}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export { MainInfoContainer };
