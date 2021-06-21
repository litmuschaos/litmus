import { Typography } from '@material-ui/core';
import React from 'react';
import { LitmusCard } from 'litmus-ui';
import { useQuery } from '@apollo/client';
import useStyles from './styles';
import { GET_GLOBAL_STATS } from '../../../graphql';
import Loader from '../../../components/Loader';

// interface UsageCount {
//   TotalCount: {
//     Workflows: {
//       Runs: number;
//       ExpRuns: number;
//       Schedules: number;
//     };
//     Agents: {
//       Ns: number;
//       Cluster: number;
//       Total: number;
//     };
//     Projects: number;
//     Users: number;
//   };
// }

const UsageStats = () => {
  const classes = useStyles();
  const { data, loading } = useQuery(GET_GLOBAL_STATS, {
    variables: {
      query: {
        DateRange: {
          start_date: Math.trunc(
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).getTime() / 1000
          ).toString(),
          end_date: Math.trunc(new Date().getTime() / 1000).toString(),
        },
      },
    },
  });

  return (
    <div className={classes.cardDiv}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/users.svg" alt="users" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Users
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Total number of Litmus users.
              </Typography>
              <Typography
                className={`${classes.usersData} ${classes.dataField}`}
              >
                {data.UsageQuery?.TotalCount.Users}
              </Typography>
            </div>
          </LitmusCard>
          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/viewProjects.svg" alt="projects" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Projects
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Total number of Litmus projects.
              </Typography>
              <Typography
                className={`${classes.projectData} ${classes.dataField}`}
              >
                {data.UsageQuery?.TotalCount.Projects}
              </Typography>
            </div>
          </LitmusCard>
          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/targets.svg" alt="targets" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Agents
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Total number of Litmus agents connected to Litmus center.
              </Typography>
              <div className={classes.cardHeader}>
                <Typography
                  className={`${classes.agentsData} ${classes.dataField}`}
                >
                  {data.UsageQuery?.TotalCount.Agents.Total}
                </Typography>
                <div className={classes.agentType}>
                  <Typography className={classes.agentTypeText}>
                    <strong>
                      {data.UsageQuery?.TotalCount.Agents.Cluster}
                    </strong>{' '}
                    cluster scope
                  </Typography>
                  <Typography className={classes.agentTypeText}>
                    <strong>{data.UsageQuery?.TotalCount.Agents.Ns}</strong>{' '}
                    namespace scope
                  </Typography>
                </div>
              </div>
            </div>
          </LitmusCard>

          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/workflow-calender.svg" alt="schedules" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Workflow Schedules
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Total number of chaos workflows scheduled in the last one month.
              </Typography>
              <Typography
                className={`${classes.schedules} ${classes.dataField}`}
              >
                {data.UsageQuery?.TotalCount.Workflows.Schedules}
              </Typography>
            </div>
          </LitmusCard>
          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/workflows-outline.svg" alt="runs" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Workflow Runs
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Number of workflows runned last month.
              </Typography>
              <Typography className={`${classes.wfRuns} ${classes.dataField}`}>
                {data.UsageQuery?.TotalCount.Workflows.Runs}
              </Typography>
            </div>
          </LitmusCard>
          <LitmusCard
            borderColor="#B3B7CC"
            width="360px"
            height="165px"
            className={classes.litmusCard}
          >
            <div>
              <div className={classes.cardHeader}>
                <img src="./icons/myhub.svg" alt="exp runs" />
                <Typography variant="h6" className={classes.cardTitle}>
                  Experiments Runs
                </Typography>
              </div>
              <Typography className={classes.cardDescription}>
                Total number of chaos experiments run in the last one month.
              </Typography>
              <Typography className={`${classes.expRuns} ${classes.dataField}`}>
                {data.UsageQuery?.TotalCount.Workflows.ExpRuns}
              </Typography>
            </div>
          </LitmusCard>
        </>
      )}
    </div>
  );
};

export default UsageStats;
