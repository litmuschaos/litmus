import { AppBar, Typography } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import ButtonFilled from '../../components/Button/ButtonFilled';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Center from '../../containers/layouts/Center';
import Scaffold from '../../containers/layouts/Scaffold';
import { history } from '../../redux/configureStore';
import BrowseWorkflow from '../../views/ChaosWorkflows/BrowseWorkflow';
import Templates from '../../views/ChaosWorkflows/Templates';
import useStyles from './styles';

const Workflows = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Scaffold>
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
        {/* <BrowseSchedule /> */}
        <Center>
          <Typography variant="h3" align="center">
            Schedule comming soon
          </Typography>
        </Center>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Templates />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Center>
          <Typography variant="h3" align="center">
            Analytics comming soon
          </Typography>
        </Center>
      </TabPanel>
    </Scaffold>
  );
};

export default Workflows;
