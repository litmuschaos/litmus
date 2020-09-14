/* eslint-disable no-nested-ternary */
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@material-ui/core';
import NotificationsOutlinedIcon from '@material-ui/icons/NotificationsOutlined';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Message,
  NotificationIds,
  NotificationsCallBackType,
} from '../../models/header';
import NotificationListItem from './NotificationListItem';
import useStyles from './styles';

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
  const { t } = useTranslation();

  function handleClick() {
    setIsOpen(!isOpen);
  }

  function handleClickAway() {
    setIsOpen(false);
  }

  const id = isOpen ? 'scroll-playground' : null;

  const CallbackToDropdownOnDeleteNotification = (
    notificationIDs: NotificationIds
  ) => {
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
          horizontal: 'center',
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >
        <AppBar position="static" color="inherit" className={classes.noShadow}>
          {messages.length ? (
            <Box pt={1} pl={2} pb={1} pr={1}>
              <Typography variant="h6" className={classes.notifyHeading}>
                <strong>
                  Updates ({count === '0' ? messages.length : count})
                </strong>
              </Typography>
            </Box>
          ) : (
            <div />
          )}
        </AppBar>

        <List dense className={classes.tabContainer}>
          {messages.length === 0 ? (
            <ListItem>
              <ListItemText>
                {t('header.notificationDropdown.noNotifications')}
              </ListItemText>
            </ListItem>
          ) : (
            messages.map((element: Message) => (
              <NotificationListItem
                key={element.sequenceID} // index
                message={element}
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
