import { Link, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainInfoContainer } from '../../../components/MainInfoContainer';
import { OverviewContainer } from '../../../components/OverviewContainer';
import { RecentOverviewContainer } from '../../../components/RecentOverviewContainer';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import { OverviewCard } from './OverviewCard';
import useStyles from './styles';

const Overview: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const { t } = useTranslation();

  const tabs = useActions(TabActions);

  // TODO: Temp consts
  const dataSource = true;
  const dashBoard = true;
  const workflowCount = 1;

  // const { data: dashboardList } = useQuery<DashboardList, ListDashboardVars>(
  //   LIST_DASHBOARD_OVERVIEW,
  //   {
  //     variables: { projectID },
  //     fetchPolicy: 'cache-and-network',
  //   }
  // );

  // const filteredData = dashboardList?.ListDashboard.slice(-3).reverse();

  return (
    <div>
      {dashBoard ? (
        <RecentOverviewContainer
          heading="Recent Dashboards"
          link={
            <Link
              underline="none"
              color="primary"
              onClick={() => {
                tabs.changeAnalyticsDashboardTabs(2);
              }}
            >
              <Typography className={classes.linkPointer}>
                View all kubernetes dashboard
              </Typography>
            </Link>
          }
          buttonLink="/analytics/dashboard/select"
          buttonImgSrc="./icons/cloudWhite.svg"
          buttonImgAlt="Add kubernetes dashboard"
          buttonText="Add kubernetes dashbaord"
        >
          {/* {filteredData.forEach((workflow) => {
            return <OverviewCard key={workflow.name} data={workflow} />;
          })} */}
          <OverviewCard />
        </RecentOverviewContainer>
      ) : dataSource ? (
        <MainInfoContainer
          src="./icons/dashboardCloud.svg"
          alt="Schedule a workflow"
          heading="Configure a chaos interleaved dashboard"
          description="Data sources has been found to be connected in this project. Select “Add dashboard” to configure a chaos interleaved dashboard"
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/analytics/dashboard/select',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>Add dashboard</Typography>
            </ButtonFilled>
          }
        />
      ) : (
        <MainInfoContainer
          src="./icons/cloud.svg"
          alt="Schedule a workflow"
          heading="Connect data source"
          description="To configure your first Kubernetes dashboard you need to connect a data source. Select “Add data source” to connect."
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/analytics/datasource/select',
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
      {workflowCount > 0 ? (
        <RecentOverviewContainer
          heading="Recent Workflow Dashboards"
          link={
            <Link
              underline="none"
              color="primary"
              onClick={() => {
                tabs.changeAnalyticsDashboardTabs(1);
              }}
            >
              <Typography className={classes.linkPointer}>
                {t('homeViews.agentConfiguredHome.recentWorkflowRuns.viewAll')}
              </Typography>
            </Link>
          }
          buttonLink="/create-workflow"
          buttonImgSrc="./icons/calendarBlank.svg"
          buttonImgAlt="Schedule workflow"
          buttonText="Schedule workflow"
        >
          {/* {filteredData.forEach((workflow) => {
           return <OverviewCard key={workflow.name} data={workflow} />;
         })} */}
          <OverviewCard />
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
      {dataSource && (
        <OverviewContainer
          count={1}
          countUnit="Data source"
          description="Data sources are needed to configure interleaving dashboards"
          maxWidth="38.5625rem"
          button={
            <>
              <ButtonOutlined
                onClick={() => {
                  history.push({
                    pathname: '/analytics/datasource/select',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
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
