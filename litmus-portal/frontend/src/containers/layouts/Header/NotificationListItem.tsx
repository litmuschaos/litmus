import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import formatDistance from 'date-fns/formatDistance';
import ClearIcon from '@material-ui/icons/Clear';
import { Message, NotificationsCallBackType } from '../../../models/header';
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
              const idsForDeletingNotifications = {
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
