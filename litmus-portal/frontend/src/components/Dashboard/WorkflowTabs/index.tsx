import { AppBar, Box, Typography } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { history } from '../../../redux/configureStore';
import ButtonFilled from '../../Button/ButtonFilled';
import Loader from '../../Loader';
import BrowseWorkflow from '../BrowseWorkflow';
import useStyles from './styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
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
