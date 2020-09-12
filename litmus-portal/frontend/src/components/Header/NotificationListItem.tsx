import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import formatDistance from 'date-fns/formatDistance';
import React, { useState } from 'react';
import {
  Message,
  NotificationIds,
  NotificationsCallBackType,
} from '../../models/header';
import useStyles from './styles';

interface NotificationListItemProps {
  message: Message;
  CallbackOnDeleteNotification: NotificationsCallBackType;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  message,
  CallbackOnDeleteNotification,
}) => {
  const classes = useStyles();

  const [messageActive, setMessageActive] = useState(true);

  if (messageActive === false) {
    return <div />;
  }

  if (messageActive === true) {
    return (
      <ListItem className={classes.listItemSpacing}>
        <ListItemText
          primary={message.text}
          secondary={`${formatDistance(message.date * 1000, new Date())} ago`}
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => {
              setMessageActive(false);
              const idsForDeletingNotifications: NotificationIds = {
                id: message.id,
                sequenceID: message.sequenceID,
              };
              CallbackOnDeleteNotification(idsForDeletingNotifications);
            }}
          >
            <ClearIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  return <div />;
};

export default NotificationListItem;
