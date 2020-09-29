import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';
import ButtonFilled from '../../Button/ButtonFilled';
import BrowseCluster from '../../../views/ChaosWorkflows/BrowseCluster';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';

const CenteredTabs = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.header}>
          <Typography variant="h4">{t('Targets.connectHome.head')}</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled
              isPrimary
              handleClick={() => history.push('/target-connect')}
            >
              <div>{t('Targets.connectHome.connectText')}</div>
            </ButtonFilled>
          </div>
        </div>
      </section>
      <BrowseCluster />
    </Scaffold>
  );
};
export default CenteredTabs;
