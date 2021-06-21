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
    <div
      style={{
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/users.svg" alt="users" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Users
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Total number of Litmus users.
              </Typography>
              <Typography
                style={{ marginTop: 15, fontSize: 30, color: '#0098DD' }}
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/viewProjects.svg" alt="projects" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Projects
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Total number of Litmus projects.
              </Typography>
              <Typography
                style={{ marginTop: 15, fontSize: 30, color: '#00CC9A' }}
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/targets.svg" alt="targets" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Agents
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Total number of Litmus agents connected to Litmus center.
              </Typography>
              <div style={{ display: 'flex' }}>
                <Typography
                  style={{ marginTop: 15, fontSize: 30, color: '#5469D4' }}
                >
                  {data.UsageQuery?.TotalCount.Agents.Total}
                </Typography>
                <div style={{ marginLeft: 'auto', marginTop: 20 }}>
                  <Typography style={{ opacity: 0.5 }}>
                    <strong>
                      {data.UsageQuery?.TotalCount.Agents.Cluster}
                    </strong>{' '}
                    cluster scope
                  </Typography>
                  <Typography style={{ opacity: 0.5 }}>
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/workflow-calender.svg" alt="schedules" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Workflow Schedules
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Total number of chaos workflows scheduled in the last one month.
              </Typography>
              <Typography
                style={{ marginTop: 15, fontSize: 30, color: '#F2536D' }}
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/workflows-outline.svg" alt="runs" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Workflow Runs
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Number of workflows runned last month.
              </Typography>
              <Typography
                style={{ marginTop: 15, fontSize: 30, color: '#A93DDB' }}
              >
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
              <div style={{ display: 'flex' }}>
                <img src="./icons/myhub.svg" alt="exp runs" />
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  Experiments Runs
                </Typography>
              </div>
              <Typography
                style={{ color: '#696F8C', marginTop: 12, height: 30 }}
              >
                Total number of chaos experiments run in the last one month.
              </Typography>
              <Typography
                style={{ marginTop: 15, fontSize: 30, color: '#EFC078' }}
              >
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
