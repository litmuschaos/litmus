import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';
import ButtonFilled from '../../Button/ButtonFilled';
import BrowseCluster from '../../../views/ChaosWorkflows/BrowseCluster';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';

const ConnectHome = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleCluster = () => {
    history.push('/target-connect');
  };

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.header}>
          <Typography variant="h4">{t('targets.connectHome.head')}</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled isPrimary handleClick={handleCluster}>
              <div>{t('targets.connectHome.connectText')}</div>
            </ButtonFilled>
          </div>
        </div>
      </section>
      <BrowseCluster />
    </Scaffold>
  );
};
export default ConnectHome;
