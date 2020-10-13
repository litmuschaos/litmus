import { Typography, Tooltip } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { history } from '../../../redux/configureStore';
import ButtonFilled from '../../Button/ButtonFilled';
import BrowseCluster from '../../../views/ChaosWorkflows/BrowseCluster';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';
import { RootState } from '../../../redux/reducers';

const ConnectHome = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleCluster = () => {
    history.push('/target-connect');
  };

  const userRole = useSelector((state: RootState) => state.userData.userRole);

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.header}>
          <Typography variant="h3">{t('targets.connectHome.head')}</Typography>
          <Tooltip
            classes={{
              tooltip: classes.customTooltip,
            }}
            disableFocusListener
            disableHoverListener={userRole !== 'Viewer'}
            placement="bottom"
            title="Insufficient Permissions"
          >
            <div className={classes.scheduleBtn}>
              <ButtonFilled
                isPrimary={false}
                handleClick={handleCluster}
                isDisabled={userRole === 'Viewer'}
              >
                <div>{t('targets.connectHome.connectText')}</div>
              </ButtonFilled>
            </div>
          </Tooltip>
        </div>
      </section>
      <BrowseCluster />
    </Scaffold>
  );
};
export default ConnectHome;
