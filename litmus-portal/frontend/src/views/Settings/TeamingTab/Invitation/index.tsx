import { Box, Paper, Tab, Tabs, useTheme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
// import { LIST_PROJECTS } from '../../../../graphql';
import { Member, Project } from '../../../../models/graphql/user';
import { getToken, getUserId } from '../../../../utils/auth';
import AcceptedInvitations from './AcceptedInvitations';
import ReceivedInvitations from './ReceivedInvitations';
import useStyles from './styles';

interface TabPanelProps {
  index: any;
  value: any;
}

// TabPanel ise used to implement the functioning of tabs
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface InvitationProps {
  getProjectDetail: () => void;
}

// NewUserModal displays a modal on creating a new user
const Invitation: React.FC<InvitationProps> = ({ getProjectDetail }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(0);

  const userID = getUserId();

  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);

  function fetchProjectData() {
    fetch(`${config.auth.url}/list_projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data.data);
        } else {
          let otherCount = 0;
          let inviteCount = 0;
          data.data.forEach((project: Project): void => {
            project.Members.forEach((member: Member) => {
              if (member.UserID === userID && member.Invitation === 'Pending') {
                inviteCount++;
              } else if (
                member.UserID === userID &&
                member.Role !== 'Owner' &&
                member.Invitation === 'Accepted'
              ) {
                otherCount++;
              }
            });
          });
          setInvitationCount(inviteCount);
          setProjectOtherCount(otherCount);
        }
      })
      .catch((err) => {
        console.error(err);
        setInvitationCount(0);
        setProjectOtherCount(0);
      });
  }

  useEffect(() => {
    fetchProjectData();
  }, []);

  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
    fetchProjectData();
  };

  return (
    <div>
      <Paper className={classes.root} elevation={0}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <Tab
            data-cy="activeTab"
            label={
              <span
                className={activeTab === 0 ? classes.active : classes.inActive}
              >
                <span className={classes.invitationCount}>
                  {projectOtherCount}
                </span>{' '}
                {t('settings.teamingTab.active')}
              </span>
            }
            {...tabProps(0)}
          />
          <Tab
            data-cy="receivedTab"
            label={
              <span
                className={activeTab === 1 ? classes.active : classes.inActive}
              >
                <span className={classes.invitationCount}>
                  {invitationsCount}
                </span>{' '}
                {t('settings.teamingTab.invitations')}
              </span>
            }
            {...tabProps(1)}
          />
        </Tabs>
      </Paper>
      <TabPanel value={activeTab} index={0}>
        <AcceptedInvitations
          fetchData={fetchProjectData}
          getProjectDetail={getProjectDetail}
        />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ReceivedInvitations
          fetchData={fetchProjectData}
          getProjectDetail={getProjectDetail}
        />
      </TabPanel>
    </div>
  );
};
export default Invitation;
