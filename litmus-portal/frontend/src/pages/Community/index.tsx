import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import InfoFilledWrap from '../../components/InfoFilled/index';
import Loader from '../../components/Loader';
import { LocalQuickActionCard } from '../../components/LocalQuickActionCard';
import Center from '../../containers/layouts/Center';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import Wrapper from '../../containers/layouts/Wrapper';
import { RootState } from '../../redux/reducers';
import { getToken } from '../../utils/auth';
import CommunityAnalyticsPlot from '../../views/Community/CommunityTimeSeriesPlot';
import GeoMap from '../../views/Community/GeoMap/index';
import useStyles from './styles';

const Community: React.FC = () => {
  const { t } = useTranslation();
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

              <div>
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
              </div>
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
              <div className={classes.quickActionCard}>
                <LocalQuickActionCard variant="community" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Wrapper>
  );
};

export default Community;
