import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import React from 'react';
import AccountSettings from '../../components/AccountsTab/AccountSettings';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';

interface TabPanelProps {
  children: React.ReactNode;
  index: any;
  value: any;
}

// TabPanel ise used to implement the functioning of tabs
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

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
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const classes = useStyles();
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Scaffold>
      <div>
        <Typography className={classes.Head}>Settings </Typography>
        <Paper className={classes.root} elevation={0}>
          <Tabs
            className={classes.tab}
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="secondary"
          >
            <Tab label="Account" {...a11yProps(0)} />
            <Tab label="Team" {...a11yProps(1)} />
            <Tab label="USer Management" {...a11yProps(2)} />
          </Tabs>
        </Paper>
        <TabPanel value={value} index={0}>
          <AccountSettings />
        </TabPanel>
      </div>
    </Scaffold>
  );
};

export default Settings;
