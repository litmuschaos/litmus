import { useQuery } from '@apollo/client';
import { Box, Paper, Tab, Tabs, useTheme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { LIST_PROJECTS } from '../../../../graphql';
import { Member, Project, Projects } from '../../../../models/graphql/user';
import { getUserId } from '../../../../utils/auth';
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

// NewUserModal displays a modal on creating a new user
const Invitation: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };

  const userID = getUserId();

  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    let otherCount = 0;
    let inviteCount = 0;
    projects.map((project) => {
      return project.members.forEach((member: Member) => {
        if (member.user_id === userID && member.invitation === 'Pending') {
          inviteCount++;
        } else if (
          member.user_id === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          otherCount++;
        }
      });
    });
    setInvitationCount(inviteCount);
    setProjectOtherCount(otherCount);
  }, [projects, dataProject]);
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
            data-cy="receivedTab"
            label={
              <span
                className={activeTab === 0 ? classes.active : classes.inActive}
              >
                <span className={classes.invitationCount}>
                  {invitationsCount}
                </span>{' '}
                Invitations
              </span>
            }
            {...tabProps(0)}
          />
          <Tab
            data-cy="sentTab"
            label={
              <span
                className={activeTab === 1 ? classes.active : classes.inActive}
              >
                <span className={classes.invitationCount}>
                  {projectOtherCount}
                </span>{' '}
                Active
              </span>
            }
            {...tabProps(1)}
          />
        </Tabs>
      </Paper>
      <TabPanel value={activeTab} index={0}>
        <ReceivedInvitations />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <AcceptedInvitations />
      </TabPanel>
    </div>
  );
};
export default Invitation;
