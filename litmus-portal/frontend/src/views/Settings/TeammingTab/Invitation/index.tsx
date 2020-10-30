import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import React from 'react';
import useTheme from '@material-ui/core/styles/useTheme';
import { useTranslation } from 'react-i18next';
import ButtonOutline from '../../../../components/Button/ButtonOutline';
import Unimodal from '../../../../containers/layouts/Unimodal';
import ReceivedInvitations from './ReceivedInvitations';
import SentInvitations from './SentInvitations';
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
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };
  const theme = useTheme();
  return (
    <div data-cy="invitationButton">
      <div className={classes.button}>
        <ButtonOutline handleClick={handleOpen} isDisabled={false}>
          <div>{t('settings.teamingTab.invitation.button.invitation')}</div>
        </ButtonOutline>
      </div>

      <Unimodal
        data-cy="modal"
        open={open}
        handleClose={handleClose}
        hasCloseBtn
      >
        <div data-cy="invitationModal" className={classes.body}>
          <Typography className={classes.Header}>
            {t('settings.teamingTab.invitation.modal.header')}{' '}
            <strong>
              {t('settings.teamingTab.invitation.modal.headerStrong')}
            </strong>
          </Typography>
          <div>
            <Paper className={classes.root} elevation={0}>
              <Tabs
                value={activeTab}
                onChange={handleChange}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                }}
              >
                <Tab data-cy="receivedTab" label="Received" {...tabProps(0)} />
                <Tab data-cy="sentTab" label="Sent" {...tabProps(1)} />
              </Tabs>
            </Paper>
            <TabPanel value={activeTab} index={0}>
              <ReceivedInvitations />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <SentInvitations />
            </TabPanel>
          </div>
        </div>
      </Unimodal>
    </div>
  );
};
export default Invitation;
