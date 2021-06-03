import { Box, Paper, Tab, Tabs, useTheme } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './style';

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

const ScheduleAndRunStats: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
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
          <Tab data-cy="activeTab" label="Schedule stats" {...tabProps(0)} />
          <Tab data-cy="receivedTab" label=" Run stats" {...tabProps(1)} />
        </Tabs>
      </Paper>
      <TabPanel value={activeTab} index={0}></TabPanel>
      <TabPanel value={activeTab} index={1}></TabPanel>
    </div>
  );
};
export default ScheduleAndRunStats;
