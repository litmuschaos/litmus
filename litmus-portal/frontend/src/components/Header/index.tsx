import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useEffect, useState, useCallback } from 'react';
import { Menu, MenuItem, Divider, Grid } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import useStyles from './styles';
import CustomBreadCrumbs from '../CustomBreadCrumbs';
import NotificationsPopperButton from '../NotificationDropdown';
import ProfileDropdown from '../ProfileDropdown';

const Header = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [messages, setMessages] = useState([]);

  const [countOfMessages, setCountOfMessages] = useState(0);

  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const callBackForProfileDropdown = () => {};

  const fetchRandomMessages = useCallback(() => {
    const messages = [];

    const notificationsList = [
      {
        workflowName: 'Pod Delete',
        status: 'complete',
        workflowPic:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/1200px-Kubernetes_logo_without_workmark.svg.png',
      },
      {
        workflowName: 'Argo Chaos',
        status: 'started running',
        workflowPic:
          'https://pbs.twimg.com/profile_images/1272548541827649536/P4-0iQen_400x400.jpg',
      },
      {
        workflowName: 'New',
        status: 'crashed',
        workflowPic:
          'https://res.cloudinary.com/practicaldev/image/fetch/s--jZgtY8cn--/c_imagga_scale,f_auto,fl_progressive,h_1080,q_auto,w_1080/https://res.cloudinary.com/practicaldev/image/fetch/s--x3KZoo7u--/c_imagga_scale%2Cf_auto%2Cfl_progressive%2Ch_420%2Cq_auto%2Cw_1000/https://dev-to-uploads.s3.amazonaws.com/i/0v6zstfufm96e09isqo6.png',
      },
    ];

    const iterations = notificationsList.length;

    localStorage.setItem('#ActiveMessages', `${notificationsList.length}`);

    const oneDaySeconds = 60 * 60 * 24;
    let curUnix = Math.round(
      new Date().getTime() / 1000 - iterations * oneDaySeconds
    );
    for (let i = 0; i < iterations; i += 1) {
      const notificationItem = notificationsList[i];
      const message = {
        id: i,
        workflowName: notificationItem.workflowName,
        date: curUnix,
        text: `${notificationItem.workflowName} Workflow ${notificationItem.status}`,
        picUrl: notificationItem.workflowPic,
      };
      curUnix += oneDaySeconds;
      messages.push(message);
    }
    messages.reverse();
    setMessages(messages as any);
  }, [setMessages]);

  const updateCount = useCallback(() => {
    setCountOfMessages(messages.length);
  }, [messages.length]);

  useEffect(() => {
    fetchRandomMessages();
    updateCount();
  }, [fetchRandomMessages, updateCount]);

  return (
    <div>
      <AppBar position="relative" className={classes.appBar} elevation={0}>
        <Toolbar>
          <Grid container>
            <Grid item xs={5} className={classes.breadCrumbsGrid} sm={5}>
              <CustomBreadCrumbs location={useLocation().pathname} />
            </Grid>

            <Grid item xs={7} sm={7}>
              <Grid container>
                <Grid item xs={3} sm={3} />
                <Grid item xs={9} sm={9}>
                  <Grid container>
                    <Grid item xs={3} sm={3}>
                      <Grid container>
                        <Grid item xs={10} sm={10} />
                        <Grid item xs={2} sm={2}>
                          <div className={classes.notificationSection}>
                            <NotificationsPopperButton
                              count={`${countOfMessages}`}
                              messages={messages}
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={9} sm={9}>
                      <ProfileDropdown
                        callbackFromParent={callBackForProfileDropdown}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>

        <Divider />
      </AppBar>

      {renderMenu}
    </div>
  );
};

export default Header;
