import { Tooltip, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import BrowseCluster from '../../views/Targets/BrowseCluster';
import useStyles from './styles';

const Targets: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const userRole = getProjectRole();

  const handleCluster = () => {
    history.push({
      pathname: '/target-connect',
      search: `?projectID=${projectID}&projectRole=${userRole}`,
    });
  };

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
                variant="success"
                onClick={handleCluster}
                disabled={userRole === 'Viewer'}
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
export default Targets;
