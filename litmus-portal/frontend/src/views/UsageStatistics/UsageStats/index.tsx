import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { GET_GLOBAL_STATS } from '../../../graphql';
import Card from './Cards';
import useStyles from './styles';

const UsageStats = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [usageQuery, { loading, data }] = useLazyQuery(GET_GLOBAL_STATS);

  useEffect(() => {
    usageQuery({
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
  }, []);

  return (
    <div className={classes.cardDiv}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Card
            image="./icons/users.svg"
            header={t('usage.card.userHeader')}
            subtitle={t('usage.card.userSubtitle')}
            color={classes.usersData}
            data={data?.UsageQuery.TotalCount.Users}
          />
          <Card
            image="./icons/viewProjects.svg"
            header={t('usage.card.projectHeader')}
            subtitle={t('usage.card.projectSubtitle')}
            color={classes.projectData}
            data={data?.UsageQuery.TotalCount.Projects}
          />
          <Card
            image="./icons/targets.svg"
            header={t('usage.card.agentHeader')}
            subtitle={t('usage.card.agentSubtitle')}
            color={classes.agentsData}
            data={data?.UsageQuery.TotalCount.Agents.Total}
            split
            subData={[
              {
                option1: data?.UsageQuery.TotalCount.Agents.Cluster,
                option2: `${t('usage.card.agentClusterScope')}`,
              },
              {
                option1: data?.UsageQuery.TotalCount.Agents.Ns,
                option2: `${t('usage.card.agentNamespaceScope')}`,
              },
            ]}
          />

          <Card
            image="./icons/workflow-calender.svg"
            header={t('usage.card.workflowScheduleHeader')}
            subtitle={t('usage.card.workflowScheduleSubtitle')}
            color={classes.schedules}
            data={data?.UsageQuery.TotalCount.Workflows.Schedules}
          />
          <Card
            image="./icons/workflows-outline.svg"
            header={t('usage.card.workflowRunHeader')}
            subtitle={t('usage.card.workflowRunSubtitle')}
            color={classes.wfRuns}
            data={data?.UsageQuery.TotalCount.Workflows.Runs}
          />
          <Card
            image="./icons/myhub.svg"
            header={t('usage.card.experimentRunHeader')}
            subtitle={t('usage.card.experimentRunSubtitle')}
            color={classes.expRuns}
            data={data?.UsageQuery.TotalCount.Workflows.ExpRuns}
          />
        </>
      )}
    </div>
  );
};

export default UsageStats;
