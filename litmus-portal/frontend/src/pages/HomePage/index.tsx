import { useLazyQuery, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
import WelcomeModal from '../../views/Home/WelcomeModal';
import useStyles from './style';

interface ParamType {
  projectID: string;
}

const HomePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const userData = getUserDetailsFromJwt();
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const { projectID } = useParams<ParamType>();

  console.log('On home page!!');

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
      if (data?.listProjects) {
        data?.listProjects.map((project) => {
          project.members.forEach((member: Member) => {
            if (member.user_id === userID && member.role === 'Owner') {
              const id = project.id;
              window.location.assign(`/home/${id}`);
              // history.push(`/home/${id}`);
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

  useQuery<Projects>(LIST_PROJECTS, {
    skip: projectID ? true : false,
    onCompleted: (data) => {
      let isOwnerOfProject = false;
      if (data.listProjects) {
        data.listProjects.map((project) => {
          project.members.forEach((member: Member) => {
            if (member.user_id === userID && member.role === 'Owner') {
              const id = project.id;
              isOwnerOfProject = true;
              window.location.assign(`/home/${id}`);
              // history.push(`/home/${id}`);
            }
          });
        });
        if (!isOwnerOfProject) setIsOpen(true);
      }
    },
    fetchPolicy: 'no-cache',
  });

  const [dataPresent, setDataPresent] = useState<boolean>(true);

  return (
    <div>
      <Scaffold>
        {isOpen && !loading ? (
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
