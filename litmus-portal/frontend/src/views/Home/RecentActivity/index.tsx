/* eslint-disable no-nested-ternary */
import React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core';
import RecentActivityListItem from './RecentActivityListItem';
import useStyles from './style';
import { Message } from '../../../models/header';

interface RecentActivityProps {
  activities: Message[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const classes = useStyles();

  return (
    <List dense className={classes.tabContainer}>
      {activities.length === 0 ? (
        <ListItem>
          <ListItemText>No recent activity.</ListItemText>
        </ListItem>
      ) : (
        activities.map((element: any) => (
          <RecentActivityListItem
            key={element.sequenceID} // index
            message={element}
          />
        ))
      )}
    </List>
  );
};

export default RecentActivity;
