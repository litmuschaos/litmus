import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';
import Wrapper from '../../containers/layouts/Wrapper';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import { RootState } from '../../redux/reducers';
import { getToken } from '../../utils/auth';
import CommunityCards from '../../views/Community/CommunityCards';
import CommunityFooter from '../../views/Community/CommunityFooter';
import CommunityAnalyticsPlot from '../../views/Community/CommunityTimeSeriesPlot';
import GeoMap from '../../views/Community/GeoMap/index';
import InfoFilledWrap from '../../views/Community/InfoFilled/index';
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
          <Typography variant="h3" className={classes.mainHeader}>
            {t('community.title')}
          </Typography>

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
        <Typography variant="h3" className={classes.mainHeader}>
          {t('community.title')}
        </Typography>

        {/* Litmus Daily Insights */}
        <section className={classes.paper}>
          <Typography className={classes.header2}>
            {t('community.heading')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('community.headingDesc')}
          </Typography>
          <div className={classes.cardDiv}>
            <InfoFilledWrap />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section>
          <div className={classes.LitmusAnalyticsBlock}>
            <div className={classes.LitmusAnalyticsDiv}>
              <Paper className={classes.paper}>
                <Typography className={classes.header2}>
                  {t('community.analyticDesc')}
                </Typography>
                <CommunityAnalyticsPlot />
              </Paper>
            </div>
          </div>
        </section>

        {/* Litmus Used Statistics all over the World */}
        <section>
          <div className={classes.LitmusUsedBlock}>
            <div className={classes.LitmusUsedDiv}>
              <Paper className={classes.paper}>
                <Typography className={classes.header2}>
                  {t('community.statsHeading')}
                </Typography>
                <GeoMap />
              </Paper>
            </div>
          </div>
        </section>
        <section>
          <CommunityCards />
        </section>
        <CommunityFooter />
      </div>
    </Wrapper>
  );
};

export default Community;
