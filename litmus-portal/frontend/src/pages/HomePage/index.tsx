import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import { getUsername } from '../../utils/auth';
import LandingHome from '../../views/Home/LandingHome';
import ReturningHome from '../../views/Home/ReturningHome';
import useStyles from './styles';

const HomePage: React.FC = () => {
  const [dataPresent, setDataPresent] = useState<boolean>(true);
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Scaffold>
      <Typography variant="h3" className={classes.userName}>
        {t('home.heading')} {getUsername()}
      </Typography>
      {dataPresent ? (
        <ReturningHome
          callbackToSetDataPresent={(dataPresent: boolean) => {
            setDataPresent(dataPresent);
          }}
          currentStatus={dataPresent}
        />
      ) : (
        <LandingHome />
      )}
    </Scaffold>
  );
};

export default HomePage;
