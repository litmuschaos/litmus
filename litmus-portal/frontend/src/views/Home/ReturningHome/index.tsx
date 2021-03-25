import { Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import AgentCard from './AgentCard';
import PassFailCard from './PassFailCard';
import ProjectCard from './ProjectsCard';
import QuickActionCard from './QuickActionCard';
import ResilienceScoreCard from './ResilienceScoreCard';
import useStyles from './styles';
import WorkflowCard from './WorkFlowCard';

const ReturningHome: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="h3" className={classes.userName}>
        {t('home.heading')}
      </Typography>

      {/* Row 1 */}

      <div className={classes.firstRow}>
        {/* <WorkflowCard /> */}
        {/* <ResilienceScoreCard /> */}
        {/* <ProjectCard /> */}
        {/* <AgentCard /> */}
        {/* <PassFailCard /> */}
        {/* <QuickActionCard /> */}
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={2}>
            <Grid item xs={4}>
              <WorkflowCard />
            </Grid>
            <Grid item xs={4}>
              <ResilienceScoreCard />
            </Grid>
            <Grid item xs={4}>
              <ProjectCard />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={4}>
              <AgentCard />
            </Grid>
            <Grid item xs={4}>
              <PassFailCard />
            </Grid>
            <Grid item xs={4}>
              <QuickActionCard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default ReturningHome;
