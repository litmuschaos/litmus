import { useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import InfoFilledWrap from '../../components/InfoFilled/index';
import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';
import Wrapper from '../../containers/layouts/Wrapper';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import { RootState } from '../../redux/reducers';
import SlackLogo from '../../svg/slack.svg';
import { getToken } from '../../utils/auth';
import CommunityAnalyticsPlot from '../../views/Community/CommunityTimeSeriesPlot';
import GeoMap from '../../views/Community/GeoMap/index';
import useStyles from './styles';

const Community: React.FC = () => {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const classes = useStyles();
  const token = getToken();
  const analyticsAction = useActions(AnalyticsActions);

  const { loading, error } = useSelector(
    (state: RootState) => state.communityData
  );

  useEffect(() => {
    if (token !== '') {
      analyticsAction.loadCommunityAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <>
        <div className={classes.root}>
          <div>
            <Typography variant="h3" className={classes.mainHeader}>
              {t('community.title')}
            </Typography>
            <div>
              <Loader />
              <Typography>{t('internetIssues.fetchData')}</Typography>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <Wrapper>
        <div className={classes.root}>
          <div>
            <Typography variant="h3" className={classes.mainHeader}>
              {t('community.title')}
            </Typography>
          </div>
          <div className={classes.errorMessage}>
            <Center>
              <Typography variant="h4">
                {t('internetIssues.connectionError')}
              </Typography>
            </Center>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className={classes.root}>
        <div>
          <Typography variant="h3" className={classes.mainHeader}>
            {t('community.title')}
          </Typography>
        </div>

        {/* Litmus Daily Insights */}
        <section>
          <Typography className={classes.header2}>
            {t('community.heading')}
          </Typography>
          <Typography>{t('community.headingDesc')}</Typography>
          <div className={classes.cardDiv}>
            <InfoFilledWrap />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section>
          <div className={classes.LitmusAnalyticsBlock}>
            <Typography className={classes.header2}>
              {t('community.analyticDesc')}
            </Typography>
            <div className={classes.LitmusAnalyticsDiv}>
              <Paper className={classes.paper}>
                <CommunityAnalyticsPlot />
              </Paper>

              {/* <div>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <div className={classes.imgDiv}>
                      <img src="./icons/litmusPurple.svg" alt="litmus logo" />
                    </div>
                    <Typography
                      variant="body1"
                      component="p"
                      className={classes.LitmusOnDev}
                    >
                      {t('community.litmusChaos')}
                      <br />
                      <span className={classes.LitmusOnDevSpan}>on </span>
                      <img
                        className={classes.devToLogo}
                        src="./icons/devto.svg"
                        alt="DevTo logo"
                      />
                    </Typography>
                  </CardContent>
                  <a
                    href="https://dev.to/litmus-chaos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.devToLink}
                  >
                    <Button variant="contained" className={classes.followBtn}>
                      {t('community.follow')}
                    </Button>
                  </a>
                </Card>
              </div> */}
            </div>
          </div>
        </section>

        {/* Litmus Used Statistics all over the World */}
        <section>
          <div className={classes.LitmusUsedBlock}>
            <Typography className={classes.header2}>
              {t('community.statsHeading')}
            </Typography>
            <div className={classes.LitmusUsedDiv}>
              <Paper className={classes.paper}>
                <GeoMap />
              </Paper>
              {/* <div className={classes.quickActionCard}>
                <LocalQuickActionCard variant="community" />
              </div> */}
            </div>
          </div>
        </section>
        <section>
          <div
            style={{
              display: 'grid',
              gridGap: '1rem',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto',
              gridTemplateAreas: `"feedback slack" 
              "communityEvents communityEvents"`,
            }}
            className={classes.paper}
          >
            <div className={`${classes.joinCard} ${classes.feedback}`}>
              <div style={{ display: 'flex' }}>
                <img
                  style={{ height: '3rem', width: '3rem' }}
                  src={'./icons/feedback.svg'}
                  alt="right-arrow"
                />
                <div>
                  <Typography className={classes.joinCardTextMedium}>
                    What do you think of Litmus?
                  </Typography>
                  <Typography className={classes.joinCardTextSmall}>
                    Provide your valuable feedback
                  </Typography>
                </div>
              </div>
              {/* <ButtonFilled
                className={`${classes.joinButton} ${classes.buttonLarge}`}
              >
                Provide Feedback
              </ButtonFilled> */}
              <img
                style={{ height: '0.9375rem' }}
                src={'./icons/right-arrow.svg'}
                alt="right-arrow"
              />
            </div>
            <div className={`${classes.joinCard} ${classes.slack}`}>
              <div className={classes.cardTextWithLogo}>
                <Typography className={classes.joinCardText}>
                  Litmuschaos on
                </Typography>
                <img
                  src={SlackLogo}
                  alt="Slack logo"
                  className={classes.logo}
                />
              </div>
              <img
                style={{ height: '0.9375rem' }}
                src={'./icons/right-arrow.svg'}
                alt="right-arrow"
              />
            </div>
            {/* <div className={`${classes.joinCard} ${classes.dev}`}>
              <div className={classes.cardTextWithLogo}>
                <Typography className={classes.joinCardText}>
                  Litmuschaos on
                </Typography>
                <img
                  className={`${classes.devToLogo} ${classes.logo}`}
                  src="./icons/devto.svg"
                  alt="DevTo logo"
                />
              </div>
              <ButtonFilled
                className={`${classes.joinButton} ${classes.buttonSmall}`}
              >
                Follow
              </ButtonFilled>
            </div> */}

            <div className={`${classes.joinCard} ${classes.communityEvents}`}>
              <div style={{ display: 'flex' }}>
                <img
                  style={{ height: '3rem', width: '3rem' }}
                  src={'./icons/communityMeetup.svg'}
                  alt="right-arrow"
                />
                <div>
                  <Typography className={classes.joinCardTextMedium}>
                    Know about Community Events
                  </Typography>
                  <Typography className={classes.joinCardTextSmall}>
                    Explore about monthly community sync ups, Kubernetes meet
                    ups and other events in CNCF
                  </Typography>
                </div>
              </div>
              <img
                style={{ height: '0.9375rem' }}
                src={'./icons/right-arrow.svg'}
                alt="right-arrow"
              />
            </div>
          </div>
        </section>

        <footer>
          <div
            style={{
              height: '5.3125rem',
              background: 'white',
              position: 'relative',
              marginTop: '2rem',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            className={classes.paper}
          >
            <div
              style={{
                width: '20rem',
              }}
            >
              <span className={classes.footerText}>
                Follow us on other platforms
              </span>
            </div>
            <div
              style={{
                width: '20rem',
              }}
            >
              <div style={{ display: 'flex-root' }}>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img src={'./icons/github.svg'} alt="plugin" />
                </button>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img src={'./icons/meetup.svg'} alt="plugin" />
                </button>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img
                    className={`${classes.devTologo}`}
                    src="./icons/devto.svg"
                    alt="DevTo logo"
                  />
                </button>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img src={'./icons/twitter.svg'} alt="plugin" />
                </button>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img src={'./icons/medium.svg'} alt="plugin" />
                </button>
                <button
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '0',
                    width: '2rem',
                    height: '2rem',
                    verticalAlign: 'middle',
                    marginRight: '1rem',
                  }}
                >
                  <img src={'./icons/youtube.svg'} alt="plugin" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Wrapper>
  );
};

export default Community;
