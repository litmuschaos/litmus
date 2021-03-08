import { useMutation, useQuery } from '@apollo/client';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core';
import { Modal, ButtonOutlined } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ButtonFilled from '../../components/Button/ButtonFilled';
import ButtonOutline from '../../components/Button/ButtonOutline';
import DeveloperGuide from '../../components/DeveloperGuide';
import Loader from '../../components/Loader';
import QuickActionCard from '../../components/QuickActionCard';
import VideoCarousel from '../../components/VideoCarousel';
import Scaffold from '../../containers/layouts/Scaffold';
import {
  DELETE_HUB,
  GET_HUB_STATUS,
  GET_PROJECT_ROLES,
  SYNC_REPO,
} from '../../graphql';
import { Project, Member } from '../../models/graphql/user';
import { HubDetails, HubStatus } from '../../models/redux/myhub';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getUserId } from '../../utils/auth';
import CustomMyHubCard from './customMyHubCard';
import useStyles from './styles';

interface ParamType {
  projectID: string;
}

interface DeleteHub {
  deleteHubModal: boolean;
  hubID: string;
}

interface RefreshState {
  openSnackBar: boolean;
  refreshText: string;
}

const MyHub: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Get selected projectID from the URL
  const { projectID } = useParams<ParamType>();
  const userID = getUserId();

  const [userRole, setuserRole] = useState<string>('');

  // Set userRole
  useQuery<Project>(GET_PROJECT_ROLES, {
    variables: { projectID: projectID },
    onCompleted: (data) => {
      if (data.members) {
        data.members.forEach((member: Member) => {
          if (member.user_id === userID) {
            setuserRole(member.role);
          }
        });
      }
    },
  });

  // Get MyHubs with Status
  const { data, loading, refetch } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: projectID },
    fetchPolicy: 'cache-and-network',
  });

  const [loader, setLoader] = useState(false);

  // Mutation to refresh a repo
  const [refreshRepo, { loading: refreshLoading }] = useMutation(SYNC_REPO, {
    refetchQueries: [
      {
        query: GET_HUB_STATUS,
        variables: { data: projectID },
      },
    ],
    onError: () => {
      refetch();
    },
  });

  // Mutation to sync a repo
  const [syncRepo] = useMutation(SYNC_REPO, {
    onCompleted: () => {
      refetch();
      setLoader(false);
    },
    onError: () => {
      refetch();
      setLoader(false);
    },
  });

  // Mutation to delete a repo
  const [deleteRepo] = useMutation(DELETE_HUB, {
    onCompleted: () => {
      refetch();
    },
  });

  const totalHubs = data && data.getHubStatus;

  const [github, setGithub] = useState(true);
  const [key, setKey] = useState('');
  const [deleteHub, setDeleteHub] = useState<DeleteHub>({
    deleteHubModal: false,
    hubID: '',
  });
  const handleSync = (hubId: string) => {
    syncRepo({
      variables: {
        id: hubId,
      },
    });
    setKey(hubId);
    setLoader(true);
  };

  const handleHubDelete = () => {
    deleteRepo({
      variables: {
        hub_id: deleteHub.hubID,
      },
    });
    setDeleteHub({
      deleteHubModal: false,
      hubID: '',
    });
  };

  const handleDelete = (hubId: string) => {
    setDeleteHub({
      deleteHubModal: true,
      hubID: hubId,
    });
  };

  const handleClose = () => {
    setDeleteHub({
      deleteHubModal: false,
      hubID: '',
    });
  };

  const handleRefresh = (hubId: string) => {
    setKey(hubId);
    refreshRepo({
      variables: {
        id: hubId,
      },
    });
  };

  return (
    <Scaffold>
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Header Div */}
          <div className={classes.header}>
            <Typography variant="h3" gutterBottom>
              {t('myhub.mainPage.header')}
            </Typography>
            <Typography variant="h4">
              <strong>{t('myhub.mainPage.github')}</strong>
            </Typography>
          </div>
          {/* Charts Div */}
          <div className={classes.mainDiv}>
            <div className={classes.detailsDiv}>
              {github ? (
                <div className={classes.githubConfirmed}>
                  <Typography variant="h4" gutterBottom>
                    <strong>{t('myhub.mainPage.availableHubs')}</strong>
                  </Typography>
                  <Typography className={classes.connectHub}>
                    {t('myhub.mainPage.switchHub')}
                  </Typography>
                  <div className={classes.noHub}>
                    {totalHubs && totalHubs.length === 0 ? (
                      <DeveloperGuide
                        header={t('myhub.mainPage.devGuideHeader')}
                        description={t('myhub.mainPage.devGuideDescription')}
                        expAvailable={false}
                      />
                    ) : (
                      <></>
                    )}
                    <div className={classes.chartsGroup}>
                      {totalHubs &&
                        totalHubs.map((hub: HubDetails) => (
                          <CustomMyHubCard
                            key={hub.id}
                            hub={hub}
                            loader={loader}
                            keyValue={key}
                            handleSync={handleSync}
                            handleDelete={handleDelete}
                            handleRefresh={handleRefresh}
                            refreshLoader={refreshLoading}
                          />
                        ))}
                      {userRole !== 'Viewer' ? (
                        <Card
                          elevation={3}
                          className={classes.cardDiv}
                          onClick={() => {
                            history.push({
                              pathname: '/myhub/connect',
                            });
                          }}
                        >
                          <CardActionArea>
                            <CardContent className={classes.cardContent}>
                              <img src="/icons/add-hub.svg" alt="add-hub" />
                              <Typography variant="h6" align="center">
                                {t('myhub.mainPage.connectNewHub')}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                //  No GitHub connected div
                <div className={classes.noGithubAccount}>
                  <img src="/icons/myhub-crossed.svg" alt="myhub" />
                  <Typography variant="h4" className={classes.noGitHubText}>
                    <strong>{t('myhub.mainPage.noGithubCredentials')}</strong>
                  </Typography>
                  <ButtonFilled
                    isPrimary={false}
                    handleClick={() => {
                      setGithub(true);
                    }}
                  >
                    {t('myhub.mainPage.submitBtn')}
                  </ButtonFilled>
                </div>
              )}
              {deleteHub.deleteHubModal ? (
                <Modal
                  open={deleteHub.deleteHubModal}
                  onClose={handleClose}
                  modalActions={
                    <ButtonOutlined onClick={handleClose}>
                      &#x2715;
                    </ButtonOutlined>
                  }
                >
                  <div className={classes.modalDiv}>
                    <img src="/icons/red-cross.svg" alt="disconnect" />
                    <Typography className={classes.disconnectHeader}>
                      {t('myhub.mainPage.disconnectHeader')}
                    </Typography>
                    <Typography className={classes.disconnectConfirm}>
                      {t('myhub.mainPage.disconnectDesc')}
                    </Typography>
                    <div className={classes.disconnectBtns}>
                      <ButtonOutline
                        isDisabled={false}
                        handleClick={handleClose}
                      >
                        {t('myhub.mainPage.cancel')}
                      </ButtonOutline>
                      <ButtonFilled
                        isPrimary={false}
                        isWarning
                        handleClick={handleHubDelete}
                      >
                        {t('myhub.mainPage.deleteHub')}
                      </ButtonFilled>
                    </div>
                  </div>
                </Modal>
              ) : null}
            </div>

            <div className={classes.root}>
              {/* Video Carousel Div */}
              <VideoCarousel />
              <Typography className={classes.videoDescription}>
                {t('myhub.mainPage.videoDescription')}
              </Typography>
              <div className={classes.quickActionDiv}>
                <QuickActionCard />
              </div>
            </div>
          </div>
        </>
      )}
      {/* Header Div */}
    </Scaffold>
  );
};

export default MyHub;
