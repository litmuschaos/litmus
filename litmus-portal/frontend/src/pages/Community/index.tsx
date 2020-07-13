import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import InfoFilled from '../../components/InfoFilled/index';
import Scaffold from '../../containers/layouts/Scaffold/index';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import { RootState } from '../../redux/reducers';

interface CardValueData {
  color: string;
  value: number;
  statType: string;
  plus?: boolean | undefined;
}

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
  const communityData = useSelector((state: RootState) => state.communityData);
  const cardData: CardValueData[] = [
    {
      color: '#109B67',
      value: parseInt(communityData.google.operatorInstalls, 10),
      statType: 'Operator Installed',
      plus: true,
    },
    {
      color: '#858CDD',
      value: parseInt(communityData.google.totalRuns, 10),
      statType: 'Total Experiment Runs',
      plus: true,
    },
    {
      color: '#F6B92B',
      value: parseInt(communityData.github.experimentsCount, 10),
      statType: 'Total Experiments',
    },
    {
      color: '#BA3B34',
      value: parseInt(communityData.github.stars, 10),
      statType: 'Github Stars',
      plus: true,
    },
  ];

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
            {cardData.map((data) => (
              <InfoFilled
                color={data.color}
                value={data.value}
                statType={data.statType}
                plus={data.plus}
              />
            ))}
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section className="Litmus Analytics Dashboard">
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>Periodic growth of Litmus</Header2>
            <div className={classes.LitmusAnalyticsDiv}>
              {/* This Paper should be replaced by Analytics Graph Component */}
              <Paper className={classes.paper}>Dummy Graph Analytics</Paper>
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
                  <Button variant="contained" className={classes.followBtn}>
                    Follow
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Litmus Used Statistics all over the World */}
        <section className="Litmus Used Stats">
          <div className={classes.LitmusUsedBlock}>
            <Header2>Where Litmus users are situated</Header2>
            <div className={classes.LitmusUsedDiv}>
              {/* This Paper should be replaced by World Map
              Component where Litmus is used */}
              <Paper className={classes.paper}>Dummy World Analytics</Paper>
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
