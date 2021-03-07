/* eslint-disable no-nested-ternary */
import { List, ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '../../../models/header';
import RecentActivityListItem from './RecentActivityListItem';
import useStyles from './style';

interface RecentActivityProps {
  activities: Message[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <List dense className={classes.tabContainer}>
      {activities.length === 0 ? (
        <ListItem>
          <ListItemText>{t('home.recentActivityEmpty')}</ListItemText>
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
