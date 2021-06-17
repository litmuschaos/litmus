import { useQuery } from '@apollo/client';
import { Link, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
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
import { ApplicationDashboardCard } from './ApplicationDashboardCard';
import useStyles from './styles';
import { WorkflowDashboardCard } from './WorkflowDashboardCard';

const Overview: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const { t } = useTranslation();

  const tabs = useActions(TabActions);

  let dataSource = false;
  let workflowDashboardCount = 0;
  let applicationDashboardCount = 0;
  let isAgentPresent = false;

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
  });

  // Set boolean to conditionally render the banner
  if (dataSourceListData) {
    dataSource = dataSourceListData.ListDataSource.length > 0;
  }

  // Fetch data to display for the workflow dashboard cards
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
    workflowDashboardCount = workflowData.getWorkflowRuns.workflow_runs.length;
  }

  // Fetch data to display for the application dashboard cards
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
    applicationDashboardCount = dashboardListData.ListDashboard?.length;
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

  // Prompt user to create a workflow to view analytics on
  if (!workflowDashboardCount) {
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
          <Link
            underline="none"
            color="primary"
            onClick={() => {
              tabs.changeWorkflowsTabs(2);
              history.push({
                pathname: '/workflows',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <Typography>
              {t('homeViews.agentConfiguredHome.noWorkflow.explore')}
            </Typography>
          </Link>
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
  if (applicationDashboardCount > 0) {
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
              color="primary"
              href="https://prometheus.io/docs/introduction/overview/"
              target="_blank"
              rel="noreferrer"
            >
              <Typography>Read prometheus doc</Typography>
            </Link>
          }
        />
      )}
      {dataSource && !applicationDashboardCount && (
        <MainInfoContainer
          src="./icons/dashboardCloud.svg"
          alt="Schedule a workflow"
          heading="Configure a chaos interleaved dashboard"
          description="Data source(s) have been found to be connected in this project. Select “Add dashboard” to configure a chaos interleaved dashboard"
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/analytics/dashboard/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>Add dashboard</Typography>
            </ButtonFilled>
          }
        />
      )}{' '}
      {workflowDashboardCount > 0 ? (
        <RecentOverviewContainer
          heading="Recent Workflow Dashboards"
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
                <WorkflowDashboardCard
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
      {applicationDashboardCount > 0 && (
        <RecentOverviewContainer
          heading="Recent Application Dashboards"
          buttonLink="/analytics/dashboard/create"
          buttonImgSrc="./icons/cloudWhite.svg"
          buttonImgAlt="Add dashboard"
          buttonText="Add dashbaord"
        >
          {dashboardListLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            filteredDashboardListData?.map((dashboard) => {
              return (
                <ApplicationDashboardCard
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
          count={1}
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
