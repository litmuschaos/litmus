import { List, ListItem, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import useStyles from './style';

interface QuickActionItemsProps {
  children: React.ReactNode;
}

const QuickActionItems: React.FC<QuickActionItemsProps> = ({ children }) => {
  const classes = useStyles();
  return <ListItem className={classes.listItems}>{children}</ListItem>;
};

const QuickActionCard = () => {
  const classes = useStyles();
  return (
    <div className={classes.quickActionCard}>
      <Typography className={classes.mainHeader}>Quick Actions</Typography>
      <List>
        <QuickActionItems>
          <>
            <img src="icons/cluster.png" alt="cluster" />
            <Link to="/" className={classes.listItem}>
              Connect a new cluster
            </Link>
          </>
        </QuickActionItems>
        <QuickActionItems>
          <>
            <img src="icons/team.png" alt="team" />
            <Link to="/" className={classes.listItem}>
              Invite a team member
            </Link>
          </>
        </QuickActionItems>
        <QuickActionItems>
          <>
            <img src="icons/survey.png" alt="survey" />
            <Link to="/" className={classes.listItem}>
              Take a quick survey
            </Link>
          </>
        </QuickActionItems>
        <QuickActionItems>
          <>
            <img src="icons/docs.png" alt="docs" />
            <Link to="/" className={classes.listItem}>
              Read Litmus docs
            </Link>
          </>
        </QuickActionItems>
      </List>
    </div>
  );
};

export default QuickActionCard;
