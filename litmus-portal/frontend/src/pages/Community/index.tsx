/* eslint-disable no-nested-ternary */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import InfoFilled from '../../components/InfoFilled/index';
import Scaffold from '../../containers/layouts/Scaffold/index';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import CommunityAnalyticsPlotNormal from '../../components/CommunityTimeSeriesTrendPlot';
import CommunityAnalyticsPlotCumulative from '../../components/CommunityTimeSeriesGrowthPlot';
import { RootState } from '../../redux/reducers';

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
  const { communityData } = useSelector((state: RootState) => state);

  const dailyOperators = communityData.google.dailyOperatorData;

  const dailyExperiments = communityData.google.dailyExperimentData;

  const monthlyOperators = communityData.google.monthlyOperatorData;

  const monthlyExperiments = communityData.google.monthlyExperimentData;

  const classes = useStyles();

  const [currentPlotType, setPlotType] = React.useState<{ name: string }>({
    name: 'Growth',
  });

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentPlotType;
    setPlotType({
      ...currentPlotType,
      [name]: event.target.value as string,
    });
  };

  const [currentGranularityType, setGranularityType] = React.useState<{
    name: string;
  }>({
    name: 'Monthly',
  });

  const handleChangeInGranularity = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentGranularityType;
    setGranularityType({
      ...currentGranularityType,
      [name]: event.target.value as string,
    });
  };

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
            <InfoFilled
              color="#109B67"
              value={357800000}
              plus
              statType="Total chaos Operator Installed"
            />
            <InfoFilled
              color="#858CDD"
              value={12786}
              plus
              statType="Total Experiments today"
            />
            <InfoFilled
              color="#F6B92B"
              value={2500}
              plus
              statType="Total Runs experiments today"
            />
            <InfoFilled
              color="#BA3B34"
              value={39900}
              plus
              statType="Total chaos experiments today"
            />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section className="Litmus Analytics Dashboard">
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>Periodic growth of Litmus</Header2>
            <div className={classes.LitmusAnalyticsDiv}>
              <Paper className={classes.paperTimeSeries}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel htmlFor="outlined-selection">
                    Plot Style
                  </InputLabel>
                  <Select
                    native
                    value={currentPlotType.name}
                    onChange={handleChange}
                    label="Plot Type"
                    inputProps={{
                      name: 'name',
                      id: 'outlined-selection',
                    }}
                  >
                    <option value="Growth">Growth</option>
                    <option value="Trend">Trend</option>
                  </Select>
                </FormControl>

                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel htmlFor="outlined-selection-granularity">
                    Granularity
                  </InputLabel>
                  <Select
                    native
                    value={currentGranularityType.name}
                    onChange={handleChangeInGranularity}
                    label="Granularity"
                    inputProps={{
                      name: 'name',
                      id: 'outlined-selection-granularity',
                    }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                  </Select>
                </FormControl>

                {currentPlotType.name === 'Growth' &&
                currentGranularityType.name === 'Daily' ? (
                  <CommunityAnalyticsPlotCumulative
                    OperatorData={dailyOperators}
                    ExperimentData={dailyExperiments}
                  />
                ) : currentPlotType.name === 'Trend' &&
                  currentGranularityType.name === 'Daily' ? (
                  <CommunityAnalyticsPlotNormal
                    OperatorData={dailyOperators}
                    ExperimentData={dailyExperiments}
                  />
                ) : currentPlotType.name === 'Growth' &&
                  currentGranularityType.name === 'Monthly' ? (
                  <CommunityAnalyticsPlotCumulative
                    OperatorData={monthlyOperators}
                    ExperimentData={monthlyExperiments}
                  />
                ) : currentPlotType.name === 'Trend' &&
                  currentGranularityType.name === 'Monthly' ? (
                  <CommunityAnalyticsPlotNormal
                    OperatorData={monthlyOperators}
                    ExperimentData={monthlyExperiments}
                  />
                ) : (
                  <div />
                )}
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
