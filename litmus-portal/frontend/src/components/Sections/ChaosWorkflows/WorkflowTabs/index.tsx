import { AppBar, Box, Typography } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { history } from '../../../../redux/configureStore';
import ButtonFilled from '../../../Button/ButtonFilled';
import BrowseWorkflow from '../BrowseWorkflow';
import useStyles from './styles';
import ScheduleWorkflow from '../ScheduleWorkflow';
import Templates from '../Templates';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box p={3}>
          <>{children}</>
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
      fontSize: '0.95rem',
      paddingTop: theme.spacing(1.875),
      paddingBottom: theme.spacing(1.875),
      width: '15.9375rem',
      '&:focus': {
        opacity: 1,
      },
    },
  })
)((props: StyledTabProps) => <Tab {...props} />);

const CenteredTabs = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <section className="Header section">
        <div className={classes.header}>
          <Typography variant="h4">Chaos Workflows</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled
              isPrimary={false}
              handleClick={() => history.push('/create-workflow')}
            >
              <>Schedule a workflow</>
            </ButtonFilled>
          </div>
        </div>
      </section>
      <AppBar position="static" color="default" className={classes.appBar}>
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
        <ScheduleWorkflow />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Templates />
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
    </>
  );
};
export default CenteredTabs;
