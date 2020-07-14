import React, { useCallback, useState, useEffect } from 'react';
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

interface NotificationListItemProps {
  message: any;
  divider: boolean;
  total: number;
}

function NotificationListItem(props: NotificationListItemProps) {
  const { message, divider, total } = props;

  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);

  const currentCount = total as number;

  const [messageActive, setMessageActive] = useState(true);

  const handleError = useCallback(() => {
    setHasErrorOccurred(true);
  }, [setHasErrorOccurred]);

  useEffect(() => {}, [messageActive]);

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
              src={hasErrorOccurred ? null : message.picUrl}
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
              localStorage.setItem(
                '#ActiveMessages',
                `${
                  ((localStorage.getItem('#ActiveMessages')
                    ? localStorage.getItem('#ActiveMessages')
                    : currentCount) as number) - 1
                }`
              );
            }}
          >
            <DeleteOutlineTwoToneIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  return <div />;
}

export default NotificationListItem;
