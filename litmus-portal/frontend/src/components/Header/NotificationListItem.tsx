import React, { useState } from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import formatDistance from 'date-fns/formatDistance';
import DeleteOutlineTwoToneIcon from '@material-ui/icons/DeleteOutlineTwoTone';
import { Message, NotificationsCallBackType } from '../../models/header';

interface NotificationListItemProps {
  message: Message;
  divider: boolean;
  CallbackOnDeleteNotification: NotificationsCallBackType;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  message,
  divider,
  CallbackOnDeleteNotification,
}) => {
  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);

  const [messageActive, setMessageActive] = useState(true);

  function handleError() {
    setHasErrorOccurred(true);
  }

  if (messageActive === false) {
    return <div />;
  }

  if (messageActive === true) {
    return (
      <ListItem divider={divider}>
        <ListItemAvatar>
          {hasErrorOccurred ? (
            <ErrorIcon color="secondary" />
          ) : (
            <Avatar
              src={hasErrorOccurred ? null : (message.picUrl as any)}
              onError={handleError}
            />
          )}
        </ListItemAvatar>
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
            <DeleteOutlineTwoToneIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  return <div />;
};

export default NotificationListItem;
