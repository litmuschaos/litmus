import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import ButtonFilled from '../../components/Button/ButtonFilled';
import DeveloperGuide from '../../components/DeveloperGuide';
import VideoCarousel from '../../components/VideoCarousel';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { GET_USER } from '../../graphql';
import useActions from '../../redux/actions';
import Loader from '../../components/Loader';
import * as MyHubActions from '../../redux/actions/myhub';
import { CurrentUserDetails, MyHubDetail } from '../../models/graphql/user';

const MyHub = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const myHub = useActions(MyHubActions);
  const { data, loading } = useQuery<CurrentUserDetails>(GET_USER, {
    variables: { username: userData.username },
    fetchPolicy: 'cache-and-network',
  });
  const classes = useStyles();
  const { t } = useTranslation();
  const [github, setGithub] = useState(true);

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
                    {data?.getUser.my_hub.length === 0 ? (
                      <DeveloperGuide
                        header={t('myhub.mainPage.devGuideHeader')}
                        description={t('myhub.mainPage.devGuideDescription')}
                        expAvailable={false}
                      />
                    ) : (
                      <></>
                    )}
                    <div className={classes.chartsGroup}>
                      {data?.getUser.my_hub.map((hub: MyHubDetail) => {
                        return (
                          <Card
                            key={hub.id}
                            elevation={3}
                            className={classes.cardDivChart}
                            onClick={() => {
                              myHub.setHubDetails({
                                id: hub.id,
                                HubName: hub.HubName,
                                RepoURL: hub.GitURL,
                                RepoName: hub.GitURL.split('/')[4],
                                RepoBranch: hub.GitBranch,
                                UserName: userData.username,
                              });
                              history.push('/myhub/experiments');
                            }}
                          >
                            <CardContent className={classes.cardContent}>
                              <img
                                src="/icons/my-hub-charts.svg"
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
                                {hub.GitURL.split('/')[4]}/{hub.GitBranch}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
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
