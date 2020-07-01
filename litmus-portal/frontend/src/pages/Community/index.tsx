import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CustomInfoFilled from '../../components/CustomInfoFilled/index';
import Scaffold from '../../containers/layouts/Scaffold/index';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';

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
  const classes = useStyles();
  return (
    <Scaffold>
      <div>
        <div>
          <Typography className={classes.mainHeader}>Community</Typography>
        </div>

        {/* Litmus Daily Insights */}
        <section className="Daily Insights">
          <Header2>Daily Insights</Header2>
          <Typography>
            Stats for the Litmus community in the last 24 hours
          </Typography>
          <div className={classes.cardDiv}>
            <CustomInfoFilled
              color="#109B67"
              value={12300}
              plus
              statType="Total chaos Operator Installed"
            />
            <CustomInfoFilled
              color="#858CDD"
              value={12300}
              plus
              statType="Total Experiments today"
            />
            <CustomInfoFilled
              color="#F6B92B"
              value={2500}
              plus
              statType="Total Runs experiments today"
            />
            <CustomInfoFilled
              color="#BA3B34"
              value={30000}
              plus
              statType="Total chaos experiments today"
            />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section className="Litmus Analytics Dashboard">
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>Periodic growth of Litmus</Header2>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={8}>
                <Paper className={classes.paper}>Dummy Graph Analytics</Paper>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <>
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
                        <span className={classes.LitmusOnDevSpan}>
                          <span className={classes.LitmusOnDevOnSpan}>on </span>
                          <img
                            className={classes.devToLogo}
                            src="./icons/devto.svg"
                            alt="DevTo logo"
                          />
                        </span>
                      </Typography>
                    </CardContent>
                    <Button variant="contained" className={classes.followBtn}>
                      Follow
                    </Button>
                  </Card>
                </>
              </Grid>
            </Grid>
          </div>
        </section>

        {/* Litmus Used Statistics all over the World */}
        <section className="Litmus Used Stats">
          <div className={classes.LitmusUsedBlock}>
            <Header2>Where Litmus users are situated</Header2>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={8}>
                <Paper className={classes.paper}>Dummy World Analytics</Paper>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <QuickActionCard />
              </Grid>
            </Grid>
          </div>
        </section>
      </div>
    </Scaffold>
  );
};

export default Community;
