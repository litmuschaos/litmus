import { useQuery } from '@apollo/client';
import { Tooltip, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../../containers/layouts/Scaffold';
import { GET_PROJECT_ROLES } from '../../../graphql';
import { Member, Project } from '../../../models/graphql/user';
import { history } from '../../../redux/configureStore';
import { getUserId } from '../../../utils/auth';
import { getProjectID } from '../../../utils/getSearchParams';
import BrowseCluster from '../../../views/ChaosWorkflows/BrowseCluster';
import useStyles from './styles';

const ConnectHome: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userID = getUserId();
  const projectID = getProjectID();
  const [userRole, setuserRole] = useState<string>('');

  const handleCluster = () => {
    history.push('/target-connect');
  };

  useQuery<Project>(GET_PROJECT_ROLES, {
    variables: { projectID: projectID },
    onCompleted: (data) => {
      if (data.members) {
        data.members.forEach((member: Member) => {
          if (member.user_id === userID) {
            setuserRole(member.role);
          }
        });
      }
    },
  });

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
export default ConnectHome;
