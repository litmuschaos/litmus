import { useQuery } from '@apollo/client';
import { Link, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, TextButton } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { MainInfoContainer } from '../../../components/MainInfoContainer';
import { OverviewContainer } from '../../../components/OverviewContainer';
import { RecentOverviewContainer } from '../../../components/RecentOverviewContainer';
import { UnconfiguredAgent } from '../../../components/UnconfiguredAgent';
import Center from '../../../containers/layouts/Center';
import {
  GET_CLUSTER_LENGTH,
  GET_DASHBOARD_OVERVIEW,
  GET_DATASOURCE_OVERVIEW,
  WORKFLOW_DETAILS,
} from '../../../graphql';
import { ClusterRequest, Clusters } from '../../../models/graphql/clusterData';
import {
  GetDashboard,
  GetDashboardRequest,
} from '../../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceVars,
} from '../../../models/graphql/dataSourceDetails';
import {
  Workflow,
  WorkflowDataRequest,
} from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import { sortNumAsc } from '../../../utils/sort';
import { MonitoringDashboardCard } from './MonitoringDashboardCard';
import useStyles from './styles';
import { WorkflowStatisticsCard } from './WorkflowStatisticsCard';

const Overview: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  let dataSource = false;
  let WorkflowStatisticsCount = 0;
  let monitoringDashboardCount = 0;
  let isAgentPresent = false;

  // Local state to display number of data sources
  const [dataSourceCount, setDataSourceCount] = useState<number>(0);

  // Query to check if agent is present or not
  const { data: agentList, loading: agentListLoading } = useQuery<
    Clusters,
    ClusterRequest
  >(GET_CLUSTER_LENGTH, {
    variables: { projectID: getProjectID() },
    fetchPolicy: 'network-only',
  });

  // Set boolean to conditionally render agent setup banner
  if (agentList) {
    isAgentPresent = agentList.listClusters.length > 0;
  }

  // Check for data source being present or not
  const {
    data: dataSourceListData,
    loading: dataSourceListLoading,
    error: dataSourceListError,
  } = useQuery<DataSourceList, ListDataSourceVars>(GET_DATASOURCE_OVERVIEW, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setDataSourceCount(data.listDataSource.length);
    },
  });

  // Set boolean to conditionally render the banner
  if (dataSourceListData) {
    dataSource = dataSourceListData.listDataSource.length > 0;
  }

  // Fetch data to display for the workflow statistics cards
  const {
    data: workflowData,
    loading: workflowLoading,
    error: workflowError,
  } = useQuery<Workflow, WorkflowDataRequest>(WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
        pagination: {
          page: 0,
          limit: 3,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Get count for workflowData length to render conditionally
  if (workflowData) {
    WorkflowStatisticsCount = workflowData.listWorkflowRuns.workflowRuns.length;
  }

  // Fetch data to display for the monitoring dashboard cards
  const {
    data: dashboardListData,
    loading: dashboardListLoading,
    error: dashboardListError,
  } = useQuery<GetDashboard, GetDashboardRequest>(GET_DASHBOARD_OVERVIEW, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  // Get count for dashboardListData length to render conditionally
  if (dashboardListData) {
    monitoringDashboardCount = dashboardListData.listDashboard?.length;
  }

  // Loader for confirmation of agent presence
  if (agentListLoading) {
    return (
      <div style={{ height: '50vh' }}>
        <Center>
          <Loader message="Looking for a Chaos Delegate.." />
        </Center>
      </div>
    );
  }

  // Prompt user to setup an agent before continuing
  if (!isAgentPresent) {
    return <UnconfiguredAgent />;
  }

  // Prompt user to create a workflow to view statistics on
  if (!WorkflowStatisticsCount) {
    return (
      <MainInfoContainer
        src="./icons/workflowScheduleHome.svg"
        alt="Schedule a Chaos Scenario"
        heading={t('homeViews.agentConfiguredHome.noWorkflow.heading')}
        description={t('homeViews.agentConfiguredHome.noWorkflow.description')}
        button={
          <ButtonFilled
            onClick={() => {
              history.push({
                pathname: '/create-scenario',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <Typography>
              {t('homeViews.agentConfiguredHome.noWorkflow.schedule')}
            </Typography>
          </ButtonFilled>
        }
        link={
          <TextButton
            variant="highlight"
            onClick={() => {
              tabs.changeHubTabs(0);
              history.push({
                pathname: '/myhub/Litmus%20ChaosHub',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <Typography>
              {t('homeViews.agentConfiguredHome.noWorkflow.explore')}
            </Typography>
          </TextButton>
        }
      />
    );
  }

  // Loader for Data source fetching duration
  if (dataSourceListLoading) {
    return (
      <div style={{ height: '50vh' }}>
        <Center>
          <Loader message="Loading available data sources" />
        </Center>
      </div>
    );
  }

  let filteredDashboardListData;
  // Select the latest 3 dashboards
  if (monitoringDashboardCount > 0) {
    filteredDashboardListData = dashboardListData?.listDashboard
      .slice()
      .sort((a, b) => {
        const x = b.viewedAt as unknown as number;
        const y = a.viewedAt as unknown as number;
        return sortNumAsc(x, y);
      })
      .slice(0, 3);
  }

  // Generic Apollo error:
  if (dataSourceListError || workflowError || dashboardListError) {
    console.error('Error fetching the data!');
    return (
      <div style={{ height: '50vh' }}>
        <Center>
          <Typography>Error fetching the data!</Typography>
        </Center>
      </div>
    );
  }

  return (
    <div>
      {!dataSource && (
        <MainInfoContainer
          src="./icons/cloud.svg"
          alt="Schedule a Chaos Scenario"
          heading="Connect data source"
          description="To configure your first Kubernetes dashboard you need to connect a data source. Select “Add data source” to connect."
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/analytics/datasource/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>Add data source</Typography>
            </ButtonFilled>
          }
          link={
            <Link
              underline="none"
              href="https://github.com/litmuschaos/litmus/tree/master/monitoring#model-1-optional-prometheus-scrape-config-model"
              target="_blank"
              rel="noreferrer"
            >
              <TextButton variant="highlight" className={classes.docsButton}>
                <Typography>Sample Prometheus configuration</Typography>
                <img
                  src="./icons/externalLink.svg"
                  alt="external link"
                  title="Read documentation"
                />
              </TextButton>
            </Link>
          }
        />
      )}
      {dataSource && !monitoringDashboardCount && (
        <MainInfoContainer
          src="./icons/dashboardCloud.svg"
          alt="Schedule a Chaos Scenario"
          heading="Configure a chaos interleaved dashboard"
          description="Data source(s) have been found to be connected in this project. Select “Create dashboard” to configure a chaos interleaved dashboard"
          button={
            <ButtonFilled
              style={{ marginLeft: '0' }}
              onClick={() => {
                history.push({
                  pathname: '/analytics/dashboard/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>Create dashboard</Typography>
            </ButtonFilled>
          }
        />
      )}{' '}
      {WorkflowStatisticsCount > 0 ? (
        <RecentOverviewContainer
          heading="Recently updated Chaos Scenario statistics"
          buttonLink="/create-scenario"
          buttonImgSrc="./icons/calendarBlank.svg"
          buttonImgAlt="Schedule a Chaos Scenario"
          buttonText="Schedule a Chaos Scenario"
        >
          {workflowLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            workflowData?.listWorkflowRuns.workflowRuns.map((workflow) => {
              return (
                <WorkflowStatisticsCard
                  key={workflow.workflowID}
                  data={workflow}
                />
              );
            })
          )}
        </RecentOverviewContainer>
      ) : (
        <OverviewContainer
          count={0}
          countUnit="scenarios"
          description="Create complex Chaos Scenarios, automate them and monitor the variations in resilience levels. You can use this Kubernetes cluster to create new reliability work flows and compliance reports"
          maxWidth="38.5625rem"
          button={
            <>
              <ButtonOutlined
                onClick={() => {
                  history.push({
                    pathname: '/create-scenario',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
                className={classes.infoContainerButton}
              >
                <Typography>
                  <img src="./icons/calendarBlankDark.svg" alt="calendar" />
                  {t('homeViews.agentConfiguredHome.agentInfoContainer.deploy')}
                </Typography>
              </ButtonOutlined>
            </>
          }
        />
      )}
      {monitoringDashboardCount > 0 && (
        <RecentOverviewContainer
          heading="Recently viewed monitoring dashboards"
          buttonLink="/analytics/dashboard/create"
          buttonImgSrc="./icons/cloudWhite.svg"
          buttonImgAlt="Create dashboard"
          buttonText="Create dashbaord"
        >
          {dashboardListLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            filteredDashboardListData?.map((dashboard) => {
              return (
                <MonitoringDashboardCard
                  key={dashboard.dbID}
                  data={dashboard}
                />
              );
            })
          )}
        </RecentOverviewContainer>
      )}
      {dataSource && (
        <OverviewContainer
          count={dataSourceCount}
          countUnit="Data source"
          description="Data sources are needed to configure interleaving dashboards"
          maxWidth="38.5625rem"
          button={
            <>
              <ButtonOutlined
                className={classes.infoContainerButton}
                onClick={() => {
                  history.push({
                    pathname: '/analytics/datasource/create',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
                <img src="./icons/dataSource.svg" alt="DataSource" />
                <Typography>Add data source</Typography>
              </ButtonOutlined>
            </>
          }
        />
      )}
    </div>
  );
};

export default Overview;
