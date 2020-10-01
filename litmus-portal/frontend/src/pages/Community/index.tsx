import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoFilledWrap from '../../components/InfoFilled/index';
import QuickActionCard from '../../components/QuickActionCard';
import Scaffold from '../../containers/layouts/Scaffold/index';
import CommunityAnalyticsPlot from '../../views/Community/CommunityTimeSeriesPlot';
import GeoMap from '../../views/Community/GeoMap/index';
import useStyles from './styles';

// Reusable Header Component
const Header2: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <div>
      <Typography className={classes.header2}>
        <strong>{children}</strong>
      </Typography>
    </div>
  );
};

const Community: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Scaffold>
      <div className={classes.root}>
        <div>
          <Typography variant="h3" className={classes.mainHeader}>
            Community
          </Typography>
        </div>

        {/* Litmus Daily Insights */}
        <section>
          <Header2>{t('community.heading')}</Header2>
          <Typography>{t('community.headingDesc')}</Typography>
          <div className={classes.cardDiv}>
            <InfoFilledWrap />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section>
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>{t('community.analyticDesc')}</Header2>
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
                      Litmuschaos
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
                    href="https://blog.mayadata.io/"
                    target="_blank"
                    rel="noreferrer"
                    className={classes.devToLink}
                  >
                    <Button variant="contained" className={classes.followBtn}>
                      Follow
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
            <Header2>{t('community.statsHeading')}</Header2>
            <div className={classes.LitmusUsedDiv}>
              <Paper className={classes.paper}>
                <GeoMap />
              </Paper>
              <div className={classes.quickActionCard}>
                <QuickActionCard />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Scaffold>
  );
};

export default Community;
