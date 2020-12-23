import { useQuery } from '@apollo/client';
import { Card, CardActionArea, Typography } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop/Backdrop';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import InfoFilledWrap from '../../components/InfoFilled';
import Loader from '../../components/Loader';
import QuickActionCard from '../../components/QuickActionCard';
import WelcomeModal from '../../components/WelcomeModal';
import Center from '../../containers/layouts/Center';
import Scaffold from '../../containers/layouts/Scaffold';
import { GET_USER } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Project,
} from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as TemplateSelectionActions from '../../redux/actions/template';
import * as UserActions from '../../redux/actions/user';
import configureStore, { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import ReturningHome from '../../views/Home/ReturningHome';
import useStyles from './style';
import ButtonFilled from '../../components/Button/ButtonFilled';
import * as WorkflowActions from '../../redux/actions/workflow';

const CreateWorkflowCard: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const template = useActions(TemplateSelectionActions);
  const workflowAction = useActions(WorkflowActions);
  const handleCreateWorkflow = () => {
    workflowAction.setWorkflowDetails({
      isCustomWorkflow: false,
      customWorkflows: [],
    });
    template.selectTemplate({ selectedTemplateID: 0, isDisable: true });
    history.push('/create-workflow');
  };

  return (
    <Card
      elevation={3}
      className={classes.createWorkflowCard}
      onClick={handleCreateWorkflow}
      data-cy="createWorkflow"
    >
      <CardActionArea>
        <Typography className={classes.createWorkflowHeading}>
          {t('home.workflow.heading')}
        </Typography>
        <Typography className={classes.createWorkflowTitle}>
          {t('home.workflow.info')}
        </Typography>
        <ArrowForwardIcon className={classes.arrowForwardIcon} />
      </CardActionArea>
    </Card>
  );
};

const HomePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const userData = useSelector((state: RootState) => state.userData);
  const classes = useStyles();
  const { t } = useTranslation();
  const user = useActions(UserActions);
  const tabs = useActions(TabActions);
  // Use the persistor object
  const { persistor } = configureStore();

  // Query to get user details
  const { data, loading } = useQuery<
    CurrentUserDetails,
    CurrentUserDedtailsVars
  >(GET_USER, {
    variables: { username: userData.username },
  });

  const name: string = data?.getUser.name ?? '';

  const handleModal = () => {
    setIsOpen(false);
  };

  const [dataPresent, setDataPresent] = useState<boolean>(true);

  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      setIsOpen(false);
      if (userData.selectedProjectID === '') {
        let isOwnerOfProject = { id: '', name: '' };
        const projectList: Project[] = data?.getUser.projects ?? [];
        projectList.forEach((project) => {
          const memberList: Member[] = project.members;
          memberList.forEach((member) => {
            if (
              member.user_name === data?.getUser.username &&
              member.role === 'Owner'
            ) {
              isOwnerOfProject = {
                id: project.id,
                name: project.name,
              };
            }
          });
        });
        user.updateUserDetails({
          selectedProjectID: isOwnerOfProject.id,
          userRole: 'Owner',
          selectedProjectName: isOwnerOfProject.name,
          selectedProjectOwner: userData.username,
        });
        user.updateUserDetails({ loader: false });
        // Flush data to persistor immediately
        persistor.flush();
      }
    }
  }, [data]);

  return (
    <div>
      {userData.loader ? (
        <Backdrop open className={classes.backdrop}>
          <Loader />
          <Center>
            <Typography variant="h4" align="center">
              Updating User Details
            </Typography>
          </Center>
        </Backdrop>
      ) : (
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
              {dataPresent ? (
                <ReturningHome
                  callbackToSetDataPresent={(dataPresent: boolean) => {
                    setDataPresent(dataPresent);
                  }}
                  currentStatus={dataPresent}
                />
              ) : (
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
                          handleClick={() => {
                            tabs.changeWorkflowsTabs(2);
                            history.push('/workflows');
                          }}
                          isPrimary={false}
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
              )}
              {!dataPresent ? (
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
              ) : (
                <div />
              )}
            </div>
          </div>
        </Scaffold>
      )}
    </div>
  );
};

export default HomePage;
