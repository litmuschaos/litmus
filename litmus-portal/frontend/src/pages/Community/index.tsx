import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InfoFilledWrap from '../../components/InfoFilled/index';
import Scaffold from '../../containers/layouts/Scaffold/index';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import GeoMap from '../../components/Sections/Community/GeoMap/index';
import CommunityAnalyticsPlot from '../../components/Sections/Community/CommunityTimeSeriesPlot';

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
      <div>
        <div>
          <Typography className={classes.mainHeader}>Community</Typography>
        </div>

        {/* Litmus Daily Insights */}
        <section className="Daily Insights">
          <Header2>{t('community.heading')}</Header2>
          <Typography>{t('community.headingDesc')}</Typography>
          <div className={classes.cardDiv}>
            <InfoFilledWrap />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section className="Litmus Analytics Dashboard">
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>{t('community.analyticDesc')}</Header2>
            <div className={classes.LitmusAnalyticsDiv}>
              <Paper className={classes.paper}>
                <CommunityAnalyticsPlot />
              </Paper>

              <div>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <img src="./icons/litmusPurple.svg" alt="litmus logo" />
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
                  <Link
                    to="https://blog.mayadata.io/"
                    target="_blank"
                    className={classes.devToLink}
                    onClick={(event) => {
                      event.preventDefault();
                      window.open('https://blog.mayadata.io/');
                    }}
                  >
                    <Button variant="contained" className={classes.followBtn}>
                      Follow
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Litmus Used Statistics all over the World */}
        <section className="Litmus Used Stats">
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
