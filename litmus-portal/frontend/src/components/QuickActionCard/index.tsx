import { List, ListItem, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../redux/reducers';
import useStyles from './style';

const QuickActionItems: React.FC = ({ children }) => {
  const classes = useStyles();
  return <ListItem className={classes.listItems}>{children}</ListItem>;
};

const QuickActionCard = () => {
  const classes = useStyles();
  const userRole = useSelector((state: RootState) => state.userData.userRole);

  return (
    <div className={classes.quickActionCard}>
      <Card elevation={0}>
        <Typography className={classes.mainHeader}>Quick Actions</Typography>
        <List>
          {/* <QuickActionItems>
            <img src="icons/cluster.png" alt="cluster" />
            <Link to="/" className={classes.listItem}>
              Connect a new cluster
            </Link>
          </QuickActionItems> */}
          {userRole === 'Owner' && (
            <QuickActionItems>
              <img src="icons/team.png" alt="team" />
              <Link to="/settings" className={classes.listItem}>
                Invite a team member
              </Link>
            </QuickActionItems>
          )}
          <QuickActionItems>
            <img src="icons/survey.png" alt="survey" />
            <a
              href="https://forms.gle/qMuVphRyEWCFqjD56"
              className={classes.listItem}
              target="_"
            >
              Take a quick survey
            </a>
          </QuickActionItems>
          <QuickActionItems>
            <img src="icons/docs.png" alt="docs" />
            <a
              href="https://docs.litmuschaos.io/docs/getstarted/"
              className={classes.listItem}
              target="_"
            >
              Read Litmus docs
            </a>
          </QuickActionItems>
        </List>
      </Card>
    </div>
  );
};

export default QuickActionCard;
