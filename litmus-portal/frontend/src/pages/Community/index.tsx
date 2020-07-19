/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper'; // Temporary -> Should be replaced with Chart
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { useSelector } from 'react-redux';
import InfoFilledWrap from '../../components/InfoFilled/index';
import Scaffold from '../../containers/layouts/Scaffold/index';
import useStyles from './styles';
import QuickActionCard from '../../components/QuickActionCard';
import CommunityAnalyticsPlotNormal from '../../components/CommunityTimeSeriesTrendPlot';
import CommunityAnalyticsPlotCumulative from '../../components/CommunityTimeSeriesGrowthPlot';
import GeoMap from '../../components/GeoMap/index';
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
  const classes = useStyles();

  const communityData = useSelector((state: RootState) => state.communityData);

  const dailyOperators = communityData.google.dailyOperatorData;

  const dailyExperiments = communityData.google.dailyExperimentData;

  const monthlyOperators = communityData.google.monthlyOperatorData;

  const monthlyExperiments = communityData.google.monthlyExperimentData;

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

  useEffect(() => {}, [currentPlotType, currentGranularityType]);

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
            <InfoFilledWrap />
          </div>
        </section>

        {/* Litmus Analytics Dashboard */}
        <section className="Litmus Analytics Dashboard">
          <div className={classes.LitmusAnalyticsBlock}>
            <Header2>Periodic growth of Litmus</Header2>
            <div className={classes.LitmusAnalyticsDiv}>
              <Paper className={classes.paper}>
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
            <Header2>Where Litmus users are situated</Header2>
            <div className={classes.LitmusUsedDiv}>
              {/* This Paper should be replaced by World Map
              Component where Litmus is used */}
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
