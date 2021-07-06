import { Paper, Tabs, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import React, { lazy } from 'react';
import { useSelector } from 'react-redux';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import { UserRole } from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import { getUserRole } from '../../utils/auth';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import useStyles from './styles';

const AccountSettings = lazy(
  () => import('../../views/Settings/AccountsTab/AccountSettings')
);
const GitOpsTab = lazy(() => import('../../views/Settings/GitOpsTab'));
const ImageRegistry = lazy(() => import('../../views/Settings/ImageRegistry'));
const TeamingTab = lazy(() => import('../../views/Settings/TeamingTab/Team'));
const UserManagement = lazy(
  () => import('../../views/Settings/UserManagementTab/UserManagement')
);

// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const classes = useStyles();
  const settingsTabValue = useSelector(
    (state: RootState) => state.tabNumber.settings
  );
  const role = getUserRole();
  const tabs = useActions(TabActions);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeSettingsTabs(newValue);
  };

  const theme = useTheme();

  return (
    <Scaffold>
      <Typography variant="h3" className={classes.Head}>
        Settings
      </Typography>
      <Paper className={classes.root} elevation={0}>
        <Tabs
          data-cy="settingsTabPanel"
          value={settingsTabValue}
          variant="fullWidth"
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <StyledTab data-cy="my-account" label="My Account" {...tabProps(0)} />
          <StyledTab data-cy="teaming" label="Team" {...tabProps(1)} />
          {role === UserRole.admin && (
            <StyledTab
              data-cy="user-management"
              label="User Management"
              {...tabProps(2)}
            />
          )}
          <StyledTab
            data-cy="gitOps"
            label="GitOps"
            {...tabProps(role === UserRole.admin ? 3 : 2)}
          />
          <StyledTab
            data-cy="image-registry"
            label="Image Registry"
            {...tabProps(role === UserRole.admin ? 4 : 3)}
          />
        </Tabs>
      </Paper>
      <TabPanel value={settingsTabValue} index={0}>
        <SuspenseLoader style={{ height: '100%' }}>
          <AccountSettings />
        </SuspenseLoader>
      </TabPanel>
      <div data-cy="teamTabPanel">
        <TabPanel value={settingsTabValue} index={1}>
          <SuspenseLoader style={{ height: '100%' }}>
            <TeamingTab />
          </SuspenseLoader>
        </TabPanel>
      </div>
      {role === UserRole.admin && (
        <TabPanel value={settingsTabValue} index={2}>
          <SuspenseLoader style={{ height: '100%' }}>
            <UserManagement />
          </SuspenseLoader>
        </TabPanel>
      )}
      <div data-cy="GitOpsPanel">
        <TabPanel
          value={settingsTabValue}
          index={role === UserRole.admin ? 3 : 2}
        >
          <SuspenseLoader style={{ height: '100%' }}>
            <GitOpsTab />
          </SuspenseLoader>
        </TabPanel>
      </div>
      <div data-cy="ImageRegistry">
        <TabPanel
          value={settingsTabValue}
          index={role === UserRole.admin ? 4 : 3}
        >
          <SuspenseLoader style={{ height: '100%' }}>
            <ImageRegistry />
          </SuspenseLoader>
        </TabPanel>
      </div>
    </Scaffold>
  );
};

export default Settings;
