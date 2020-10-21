import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useLazyQuery } from '@apollo/client';
import Backdrop from '@material-ui/core/Backdrop/Backdrop';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import ButtonFilled from '../../components/Button/ButtonFilled';
import DeveloperGuide from '../../components/DeveloperGuide';
import VideoCarousel from '../../components/VideoCarousel';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { GET_USER, GET_CHARTS } from '../../graphql';

import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';

const MyHub = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const [cloneloading, setcloneLoading] = useState(false);
  const { data, loading } = useQuery(GET_USER, {
    variables: { username: userData.username },
    fetchPolicy: 'cache-and-network',
  });

  const [getCharts] = useLazyQuery(GET_CHARTS, {
    onCompleted: () => {
      setcloneLoading(false);
      history.push({ pathname: '/myhub/connect' });
    },
    fetchPolicy: 'cache-and-network',
  });

  const classes = useStyles();
  const [github, setGithub] = useState(true);
  return cloneloading ? (
    <Backdrop open className={classes.backdrop}>
      <Loader />
      <Center>
        <Typography variant="h4" align="center">
          We are cloning your Repository, please Wait!!
        </Typography>
      </Center>
    </Backdrop>
  ) : loading ? null : (
    <Scaffold>
      <div className={classes.header}>
        <Typography variant="h3" gutterBottom>
          My Hub
        </Typography>
        <Typography variant="h4">
          <strong>github.com/</strong>
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        <div className={classes.detailsDiv}>
          {github ? (
            <div className={classes.githubConfirmed}>
              <Typography variant="h4" gutterBottom>
                <strong>Available chaos hubs</strong>
              </Typography>
              <Typography style={{ fontWeight: 400, fontSize: '14px' }}>
                You can switch between connected hubs or connect a new one.
              </Typography>
              <div style={{ marginTop: 20 }}>
                {data.getUser.my_hub.length === 0 ? (
                  <DeveloperGuide
                    header="You have no hubs currently connect. Start connecting your first hub"
                    description="You should have your litmus chaos hub forked and made ready before connecting to it."
                    expAvailable={false}
                  />
                ) : null}
                <div className={classes.chartsGroup}>
                  {data.getUser.my_hub.map((hub: any) => {
                    // This will be removed later
                    const repoarray: String[] = hub.GitURL.split('/');
                    const reponame: String = repoarray[repoarray.length - 1];
                    const repoOwner: String = repoarray[repoarray.length - 2];
                    return (
                      <Card
                        elevation={3}
                        className={classes.cardDiv}
                        onClick={() => {
                          setcloneLoading(true);
                          getCharts({
                            variables: {
                              chartsInput: {
                                UserName: 'admin',
                                RepoOwner: repoOwner,
                                RepoBranch: hub.GitBranch,
                                RepoName: reponame,
                              },
                            },
                          });
                        }}
                      >
                        <CardActionArea>
                          <CardContent className={classes.cardContent}>
                            {/* <img src="/icons/add-hub.svg" alt="add-hub" /> */}
                            <Typography variant="h6" align="center">
                              {reponame}
                            </Typography>
                            <Typography variant="h6" align="center">
                              {hub.GitBranch}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </div>
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
                        Connect a new chaos hub
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </div>
            </div>
          ) : (
            <div className={classes.noGithubAccount}>
              <img src="/icons/myhub-crossed.svg" alt="myhub" />
              <Typography variant="h4" className={classes.noGitHubText}>
                <strong>You have not given your Github credential</strong>
              </Typography>
              <ButtonFilled
                isPrimary={false}
                handleClick={() => {
                  setGithub(true);
                }}
              >
                Submit Now
              </ButtonFilled>
            </div>
          )}
        </div>
        <div className={classes.root}>
          <VideoCarousel />
          <Typography className={classes.videoDescription}>
            Get resilient and compliance scores for your Kuberenetes product
          </Typography>
          <div style={{ marginLeft: 45 }}>
            <QuickActionCard />
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
