/* eslint-disable no-nested-ternary */
import React, { useState, useRef } from 'react';
import {
  Popover,
  IconButton,
  AppBar,
  List,
  Divider,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Badge,
} from '@material-ui/core';
import NotificationsOutlinedIcon from '@material-ui/icons/NotificationsOutlined';
import NotificationListItem from './NotificationListItem';
import useStyles from './styles';
import { Message, NotificationsCallBackType } from '../../models/header';

interface NotificationDropdownProps {
  messages: Message[];
  count: string;
  CallbackToHeaderOnDeleteNotification: NotificationsCallBackType;
}

const NotificationsDropdown: React.FC<NotificationDropdownProps> = ({
  messages,
  count,
  CallbackToHeaderOnDeleteNotification,
}) => {
  const classes = useStyles();

  const anchorEl = useRef();

  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(!isOpen);
  }

  function handleClickAway() {
    setIsOpen(false);
  }

  const id = isOpen ? 'scroll-playground' : null;

  const CallbackToDropdownOnDeleteNotification = (notificationIDs: any) => {
    CallbackToHeaderOnDeleteNotification(notificationIDs);
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        buttonRef={anchorEl}
        aria-describedby={id as string}
        aria-label="notifications"
        color="inherit"
      >
        <Badge
          badgeContent={count === '0' ? messages.length : count}
          color="secondary"
        >
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Popover
        disableScrollLock
        id={id as string}
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >
        <AppBar position="static" color="inherit" className={classes.noShadow}>
          <Box pt={1} pl={2} pb={1} pr={1}>
            <Typography variant="subtitle1">Notifications</Typography>
          </Box>

          <Divider className={classes.divider} />
        </AppBar>

        <List dense className={classes.tabContainer}>
          {messages.length === 0 ? (
            <ListItem>
              <ListItemText>
                You don&apos;t have any new notification.
              </ListItemText>
            </ListItem>
          ) : (
            messages.map((element: any, index: any) => (
              <NotificationListItem
                key={element.sequenceID} // index
                message={element}
                divider={index !== messages.length - 1}
                CallbackOnDeleteNotification={
                  CallbackToDropdownOnDeleteNotification
                }
              />
            ))
          )}
        </List>
      </Popover>
    </div>
  );
};

export default NotificationsDropdown;
