import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import ButtonFilled from '../../components/Button/ButtonFilled';
import DeveloperGuide from '../../components/DeveloperGuide';
import VideoCarousel from '../../components/VideoCarousel';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { GET_HUB_STATUS, SYNC_REPO } from '../../graphql';
import Loader from '../../components/Loader';
import { HubDetails, HubStatus } from '../../models/redux/myhub';

const MyHub = () => {
  // UserData from Redux
  const userData = useSelector((state: RootState) => state.userData);

  // Get MyHubs with Status
  const { data, loading, refetch } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: userData.selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  const [loader, setLoader] = useState(false);

  // Mutation to sync a repo
  const [syncRepo] = useMutation(SYNC_REPO, {
    onCompleted: () => {
      refetch();
      setLoader(false);
    },
  });

  const totalHubs = data && data.getHubStatus;
  const classes = useStyles();
  const { t } = useTranslation();
  const [github, setGithub] = useState(true);
  const [key, setKey] = useState('');

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
                        totalHubs.map((hub: HubDetails) => {
                          return (
                            <Paper
                              key={hub.id}
                              elevation={3}
                              className={classes.cardDivChart}
                            >
                              <CardContent className={classes.cardContent}>
                                <Typography
                                  className={
                                    hub.IsAvailable
                                      ? classes.connected
                                      : classes.error
                                  }
                                >
                                  {hub.IsAvailable ? 'Connected' : 'Error'}
                                </Typography>
                                <img
                                  src={`/icons/${
                                    hub.HubName === 'Chaos Hub'
                                      ? 'myhub-litmus.svg'
                                      : 'my-hub-charts.svg'
                                  }`}
                                  alt="add-hub"
                                />
                                <Typography
                                  variant="h6"
                                  align="center"
                                  className={classes.hubName}
                                >
                                  {hub.HubName}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  align="center"
                                  className={classes.hubBranch}
                                >
                                  {hub.RepoURL.split('/')[4]}/{hub.RepoBranch}
                                </Typography>
                                <Typography className={classes.totalExp}>
                                  {parseInt(hub.TotalExp, 10) > 0
                                    ? `${hub.TotalExp} experiments`
                                    : '[Error: could not connect]'}
                                </Typography>
                                <hr className={classes.horizontalLine} />
                                {hub.IsAvailable ? (
                                  <ButtonFilled
                                    styles={{ width: '100%' }}
                                    handleClick={() => {
                                      history.push(`/myhub/${hub.HubName}`);
                                    }}
                                    isPrimary={false}
                                  >
                                    View
                                  </ButtonFilled>
                                ) : (
                                  <Button
                                    className={classes.failedBtn}
                                    disabled={key === hub.id && loader}
                                    onClick={() => {
                                      syncRepo({
                                        variables: {
                                          HubName: hub.HubName,
                                          projectID: userData.selectedProjectID,
                                        },
                                      });
                                      setKey(hub.id);
                                      setLoader(true);
                                    }}
                                  >
                                    {key === hub.id && loader
                                      ? t('myhub.mainPage.sync')
                                      : t('myhub.mainPage.retry')}
                                  </Button>
                                )}
                              </CardContent>
                            </Paper>
                          );
                        })}
                      {userData.userRole !== 'Viewer' ? (
                        <Card
                          elevation={3}
                          className={classes.cardDiv}
                          onClick={() => {
                            history.push({ pathname: '/myhub/connect' });
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
