import { Typography } from '@material-ui/core';
import React from 'react';
import Center from '../../containers/layouts/Center';
import useStyles from './styles';

interface LoginWrapperProps {
  title: string;
  subtitle: string;
}

const LoginWrapper: React.FC<LoginWrapperProps> = ({
  title,
  subtitle,
  children,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.rootContainer}>
      <Center>
        <div className={classes.rootDiv}>
          <Typography className={classes.heading}>{title}</Typography>
          <Typography className={classes.subheading}>{subtitle}</Typography>
          {children}
        </div>
        <img
          className={classes.logo}
          src="./icons/LitmusLogoLight.svg"
          alt="Litmus Logo"
        />
      </Center>
    </div>
  );
};

export default LoginWrapper;
