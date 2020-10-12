/* eslint-disable no-nested-ternary */
import React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import RecentActivityListItem from './RecentActivityListItem';
import useStyles from './style';
import { Message } from '../../../models/header';

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
