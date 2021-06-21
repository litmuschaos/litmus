import { useQuery } from '@apollo/client';
import React from 'react';
import Loader from '../../../components/Loader';
import { GET_GLOBAL_STATS } from '../../../graphql';
import Card from './Cards';
import useStyles from './styles';

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
          <Card
            image="./icons/users.svg"
            header="Users"
            subtitle="Total number of Litmus users."
            color={classes.usersData}
            data={data.UsageQuery?.TotalCount.Users}
          />
          <Card
            image="./icons/viewProjects.svg"
            header="Projects"
            subtitle="Total number of Litmus projects."
            color={classes.projectData}
            data={data.UsageQuery?.TotalCount.Projects}
          />
          <Card
            image="./icons/targets.svg"
            header="Agents"
            subtitle="Total number of Litmus agents connected to Litmus center."
            color={classes.agentsData}
            data={data.UsageQuery?.TotalCount.Agents.Total}
            split
            subData={[
              {
                option1: data.UsageQuery?.TotalCount.Agents.Cluster,
                option2: 'cluster scope',
              },
              {
                option1: data.UsageQuery?.TotalCount.Agents.Ns,
                option2: 'namespace scope',
              },
            ]}
          />

          <Card
            image="./icons/workflow-calender.svg"
            header="Workflow Schedules"
            subtitle="Total number of chaos workflows scheduled in the last one month."
            color={classes.schedules}
            data={data.UsageQuery?.TotalCount.Workflows.Schedules}
          />
          <Card
            image="./icons/workflows-outline.svg"
            header="Workflow Runs"
            subtitle="Number of workflows ran last month."
            color={classes.wfRuns}
            data={data.UsageQuery?.TotalCount.Workflows.Runs}
          />
          <Card
            image="./icons/myhub.svg"
            header="Experiments Runs"
            subtitle="Total number of chaos experiments run in the last one month."
            color={classes.expRuns}
            data={data.UsageQuery?.TotalCount.Workflows.ExpRuns}
          />
        </>
      )}
    </div>
  );
};

export default UsageStats;
