import { List, ListItem, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import useStyles from './style';

const QuickActionItems: React.FC = ({ children }) => {
  const classes = useStyles();
  return <ListItem className={classes.listItems}>{children}</ListItem>;
};

const QuickActionCard = () => {
  const classes = useStyles();
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const tabs = useActions(TabActions);
  const { t } = useTranslation();
  const apiDocsUrl = `${window.location.href}api-doc`;

  return (
    <div data-cy="quickActionCardComponent" className={classes.quickActionCard}>
      <Card className={classes.quickActionCard} elevation={0}>
        <Typography className={classes.mainHeader}>
          {t('quickActionCard.quickActions')}
        </Typography>
        <List>
          {/* <QuickActionItems>
            <img src="/icons/cluster.png" alt="cluster" />
            <Link to="/" className={classes.listItem}>
              Connect a new cluster
            </Link>
          </QuickActionItems> */}
          {userRole === 'Owner' && (
            <QuickActionItems>
              <div className={classes.imgDiv}>
                <img src="/icons/team.png" alt="team" />
              </div>
              <Link
                to="/settings"
                className={classes.listItem}
                onClick={() => tabs.changeSettingsTabs(1)}
              >
                {t('quickActionCard.inviteTeamMember')}
              </Link>
            </QuickActionItems>
          )}
          <QuickActionItems>
            <div className={classes.imgDiv}>
              <img src="/icons/survey.png" alt="survey" />
            </div>
            <a
              href="https://forms.gle/qMuVphRyEWCFqjD56"
              className={classes.listItem}
              target="_"
            >
              {t('quickActionCard.quickSurvey')}
            </a>
          </QuickActionItems>
          <QuickActionItems>
            <div className={classes.imgDiv}>
              <img src="/icons/docs.png" alt="docs" />
            </div>
            <a
              href="https://docs.litmuschaos.io/docs/getstarted/"
              className={classes.listItem}
              target="_"
            >
              {t('quickActionCard.readDocs')}
            </a>
          </QuickActionItems>
          <QuickActionItems>
            <div className={classes.imgDiv}>
              <img src="./icons/docs.png" alt="docs" />
            </div>
            <a href={apiDocsUrl} className={classes.listItem} target="_">
              {t('quickActionCard.readAPIDocs')}
            </a>
          </QuickActionItems>
        </List>
      </Card>
    </div>
  );
};

export default QuickActionCard;
