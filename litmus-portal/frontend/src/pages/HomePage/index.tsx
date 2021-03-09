import { useLazyQuery, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateWorkflowCard } from '../../components/CreateWorkflowCard';
import InfoFilledWrap from '../../components/InfoFilled';
import QuickActionCard from '../../components/QuickActionCard';
import Scaffold from '../../containers/layouts/Scaffold';
import { GET_USER, LIST_PROJECTS } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Projects,
} from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { getUserDetailsFromJwt, getUserId } from '../../utils/auth';
import { getProjectID } from '../../utils/getSearchParams';
import WelcomeModal from '../../views/Home/WelcomeModal';
import useStyles from './style';

const HomePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const userData = getUserDetailsFromJwt();
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const projectID = getProjectID();

  // Query to get user details
  const { data, loading } = useQuery<
    CurrentUserDetails,
    CurrentUserDedtailsVars
  >(GET_USER, {
    variables: { username: userData.username },
  });

  const name: string = data?.getUser.name ?? '';

  const userID = getUserId();

  const [listProjects] = useLazyQuery<Projects>(LIST_PROJECTS, {
    onCompleted: (data) => {
      if (data.listProjects) {
        data.listProjects.forEach((project) => {
          project.members.forEach((member: Member) => {
            if (member.user_id === userID && member.role === 'Owner') {
              history.push({
                pathname: `/home`,
                search: `?projectID=${project.id}&projectRole=${member.role}`,
              });
            }
          });
        });
      }
    },
    fetchPolicy: 'no-cache',
  });

  const handleModal = () => {
    setIsOpen(false);
    listProjects();
  };

  return (
    <div>
      <Scaffold>
        {isOpen && !loading && !projectID ? (
          <WelcomeModal handleIsOpen={handleModal} />
        ) : (
          <></>
        )}
        <div className={classes.rootContainer}>
          <div className={classes.root}>
            <Typography variant="h3" className={classes.userName}>
              {t('home.heading')}
              <strong>{` ${name}`}</strong>
            </Typography>
            <div className={classes.headingDiv}>
              <div className={classes.mainDiv}>
                <div>
                  <Typography className={classes.mainHeading}>
                    <strong>{t('home.subHeading1')}</strong>
                  </Typography>
                  <Typography className={classes.mainResult}>
                    <strong>{t('home.subHeading2')}</strong>
                  </Typography>
                  <Typography className={classes.mainDesc}>
                    {t('home.subHeading3')}
                  </Typography>
                  <div className={classes.predefinedBtn}>
                    <ButtonFilled
                      variant="success"
                      onClick={() => {
                        tabs.changeWorkflowsTabs(2);
                        history.push('/workflows');
                      }}
                    >
                      <Typography variant="subtitle1">
                        {t('home.button1')}
                      </Typography>
                    </ButtonFilled>
                  </div>
                </div>
                <div className={classes.imageDiv}>
                  <img src="icons/applause.png" alt="Applause icon" />
                </div>
              </div>
              <div>
                <CreateWorkflowCard data-cy="CreateWorkflowCard" />
              </div>
            </div>
            <div className={classes.contentDiv}>
              <div className={classes.statDiv}>
                <div className={classes.btnHeaderDiv}>
                  <Typography className={classes.statsHeading}>
                    <strong>{t('home.analytics.heading')}</strong>
                  </Typography>
                  <IconButton
                    className={classes.seeAllBtn}
                    onClick={(event) => {
                      event.preventDefault();
                      history.push('/community');
                    }}
                  >
                    <div className={classes.btnSpan}>
                      <Typography className={classes.btnText}>
                        {t('home.analytics.moreInfo')}
                      </Typography>
                      <img src="icons/next.png" alt="next" />
                    </div>
                  </IconButton>
                </div>
                <div className={classes.cardDiv}>
                  <InfoFilledWrap />
                </div>
              </div>
              <div className={classes.quickActionDiv}>
                <QuickActionCard />
              </div>
            </div>
          </div>
        </div>
      </Scaffold>
    </div>
  );
};

export default HomePage;
