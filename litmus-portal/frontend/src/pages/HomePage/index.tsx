import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import { getUsername } from '../../utils/auth';
import { AgentConfiguredHome } from '../../views/Home/AgentConfiguredHome';
import { LandingHome } from '../../views/Home/LandingHome';
import useStyles from './styles';

const HomePage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const bool = true;

  return (
    <Scaffold>
      <Typography variant="h3" className={classes.userName}>
        {t('home.heading')} {getUsername()}
      </Typography>
      {!bool ? <AgentConfiguredHome /> : <LandingHome />}
    </Scaffold>
  );
};

export default HomePage;
