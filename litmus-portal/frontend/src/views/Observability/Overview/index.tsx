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
  LIST_DASHBOARD_OVERVIEW,
  LIST_DATASOURCE_OVERVIEW,
  WORKFLOW_DETAILS,
} from '../../../graphql';
import { Clusters, ClusterVars } from '../../../models/graphql/clusterData';
import {
  DashboardList,
  ListDashboardVars,
} from '../../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceVars,
} from '../../../models/graphql/dataSourceDetails';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
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
    ClusterVars
  >(GET_CLUSTER_LENGTH, {
    variables: { project_id: getProjectID() },
    fetchPolicy: 'network-only',
  });

  // Set boolean to conditionally render agent setup banner
  if (agentList) {
    isAgentPresent = agentList.getCluster.length > 0;
  }

  // Check for data source being present or not
  const {
    data: dataSourceListData,
    loading: dataSourceListLoading,
    error: dataSourceListError,
  } = useQuery<DataSourceList, ListDataSourceVars>(LIST_DATASOURCE_OVERVIEW, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setDataSourceCount(data.ListDataSource.length);
    },
  });

  // Set boolean to conditionally render the banner
  if (dataSourceListData) {
    dataSource = dataSourceListData.ListDataSource.length > 0;
  }

  // Fetch data to display for the workflow statistics cards
  const {
    data: workflowData,
    loading: workflowLoading,
    error: workflowError,
  } = useQuery<Workflow, WorkflowDataVars>(WORKFLOW_DETAILS, {
    variables: {
      workflowRunsInput: {
        project_id: projectID,
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
    WorkflowStatisticsCount = workflowData.getWorkflowRuns.workflow_runs.length;
  }

  // Fetch data to display for the monitoring dashboard cards
  const {
    data: dashboardListData,
    loading: dashboardListLoading,
    error: dashboardListError,
  } = useQuery<DashboardList, ListDashboardVars>(LIST_DASHBOARD_OVERVIEW, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  // Get count for dashboardListData length to render conditionally
  if (dashboardListData) {
    monitoringDashboardCount = dashboardListData.ListDashboard?.length;
  }

  // Loader for confirmation of agent presence
  if (agentListLoading) {
    return (
      <div style={{ height: '50vh' }}>
        <Center>
          <Loader message="Looking for an agent.." />
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
        alt="Schedule a workflow"
        heading={t('homeViews.agentConfiguredHome.noWorkflow.heading')}
        description={t('homeViews.agentConfiguredHome.noWorkflow.description')}
        button={
          <ButtonFilled
            onClick={() => {
              history.push({
                pathname: '/create-workflow',
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
                pathname: '/myhub/Chaos%20Hub',
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
    filteredDashboardListData = dashboardListData?.ListDashboard.slice(-3);
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
          alt="Schedule a workflow"
          heading="Connect data source"
          description="To configure your first Kubernetes dashboard you need to connect a data source. Select “Add data source” to connect."
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/observability/datasource/create',
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
          alt="Schedule a workflow"
          heading="Configure a chaos interleaved dashboard"
          description="Data source(s) have been found to be connected in this project. Select “Create dashboard” to configure a chaos interleaved dashboard"
          button={
            <ButtonFilled
              style={{ marginLeft: '0' }}
              onClick={() => {
                history.push({
                  pathname: '/observability/dashboard/create',
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
          heading="Recently updated workflow statistics"
          buttonLink="/create-workflow"
          buttonImgSrc="./icons/calendarBlank.svg"
          buttonImgAlt="Schedule workflow"
          buttonText="Schedule workflow"
        >
          {workflowLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            workflowData?.getWorkflowRuns.workflow_runs.map((workflow) => {
              return (
                <WorkflowStatisticsCard
                  key={workflow.workflow_id}
                  data={workflow}
                />
              );
            })
          )}
        </RecentOverviewContainer>
      ) : (
        <OverviewContainer
          count={0}
          countUnit="workflows"
          description="Create complex chaos workflows, automate them and monitor the variations in resilience levels. You can use this Kubernetes cluster to create new reliability work flows and compliance reports"
          maxWidth="38.5625rem"
          button={
            <>
              <ButtonOutlined
                onClick={() => {
                  history.push({
                    pathname: '/create-workflow',
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
          buttonLink="/observability/dashboard/create"
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
                  key={dashboard.db_id}
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
                    pathname: '/observability/datasource/create',
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
