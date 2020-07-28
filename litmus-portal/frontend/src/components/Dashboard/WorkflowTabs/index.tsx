import React from 'react';
import { withStyles, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { AppBar, Box, Typography, Button } from '@material-ui/core';
import Loader from '../../Loader';
import BrowseWorkflow from '../BrowseWorkflow';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}
const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};
interface StyledTabProps {
  label: string;
}
const StyledTab = withStyles((theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: 'rgba(0,0,0,0.5)',
      fontSize: theme.typography.pxToRem(15),
      paddingTop: 15,
      paddingBottom: 15,
      width: 255,
      '&:focus': {
        opacity: 1,
      },
    },
  })
)((props: StyledTabProps) => <Tab {...props} />);

export default function CenteredTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <section className="Header section">
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Typography variant="h4">Chaos Workflows</Typography>
          <Button
            variant="contained"
            style={{
              backgroundColor: '#109B67',
              color: '#FFFFFF',
              marginLeft: 'auto',
            }}
          >
            <Typography variant="subtitle1">Schedule a workflow</Typography>
          </Button>
        </div>
      </section>
      <AppBar
        position="static"
        color="default"
        style={{
          background: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
        >
          <StyledTab label="Browse workflows" />
          <StyledTab label="Schedules" />
          <StyledTab label="Templates" />
          <StyledTab label="Analytics" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <BrowseWorkflow />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Loader />
      </TabPanel>
      <TabPanel value={value} index={2}>
        Something here!
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
    </>
  );
}
