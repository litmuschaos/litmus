import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Message } from '../../../models/header';

import useStyles from './style';

interface RecentActivityListItemProps {
  message: Message;
}

const RecentActivityListItem: React.FC<RecentActivityListItemProps> = ({
  message,
}) => {
  const classes = useStyles();
  return (
    <ListItem>
      <ListItemAvatar>
        <Typography className={classes.messageID}>{message.id}</Typography>
      </ListItemAvatar>
      <ListItemText primary={message.text} />
    </ListItem>
  );
};

export default RecentActivityListItem;
