import { useQuery } from '@apollo/client';
import { LitmusThemeProvider } from 'litmus-ui';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import Loader from '../../components/Loader';
import { LIST_PROJECTS } from '../../graphql';
import { Member, Projects } from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import { history } from '../../redux/configureStore';
import { getToken, getUserId } from '../../utils/auth';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import Center from '../layouts/Center';

const ErrorPage = lazy(() => import('../../pages/ErrorPage'));
const Workflows = lazy(() => import('../../pages/Workflows'));
const CreateWorkflow = lazy(() => import('../../pages/CreateWorkflow'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const GetStarted = lazy(() => import('../../pages/GetStartedPage'));
const WorkflowDetails = lazy(() => import('../../pages/WorkflowDetails'));
const BrowseTemplate = lazy(
  () => import('../../views/ChaosWorkflows/BrowseTemplate')
);
const HomePage = lazy(() => import('../../pages/HomePage'));
const Community = lazy(() => import('../../pages/Community'));
const Settings = lazy(() => import('../../pages/Settings'));
const Targets = lazy(() => import('../../pages/Targets'));
const ConnectTargets = lazy(() => import('../../pages/ConnectTarget'));
const SchedulePage = lazy(() => import('../../pages/SchedulePage'));
const AnalyticsPage = lazy(() => import('../../pages/AnalyticsPage'));
const AnalyticsDashboard = lazy(
  () => import('../../pages/AnalyticsDashboards')
);
const DataSourceSelectPage = lazy(
  () => import('../../pages/SelectAndConfigureDataSource/Select')
);
const DataSourceConfigurePage = lazy(
  () => import('../../pages/SelectAndConfigureDataSource/Configure')
);
const DashboardSelectPage = lazy(
  () => import('../../pages/SelectAndConfigureDashboards/Select')
);
const DashboardConfigurePage = lazy(
  () => import('../../pages/SelectAndConfigureDashboards/Configure')
);
const DashboardPage = lazy(() => import('../../pages/MonitoringDashboardPage'));
const MyHub = lazy(() => import('../../pages/MyHub'));
const MyHubConnect = lazy(() => import('../../views/MyHub/MyHubConnect'));
const ChaosChart = lazy(() => import('../../views/MyHub/MyHubCharts'));
const MyHubExperiment = lazy(() => import('../../views/MyHub/MyHubExperiment'));
const MyHubEdit = lazy(() => import('../../views/MyHub/MyHubEdit'));
const CreateCustomWorkflow = lazy(
  () => import('../../pages/CreateCustomWorkflow')
);

const Routes: React.FC = () => {
  console.log('App-hit');
  const baseRoute = window.location.pathname.split('/')[1];
  const projectIDFromURL = getProjectID();
  const projectRoleFromURL = getProjectRole();
  const [projectID, setprojectID] = useState<string>(projectIDFromURL);
  const [projectRole, setprojectRole] = useState<string>(projectRoleFromURL);
  const userID = getUserId();

  useQuery<Projects>(LIST_PROJECTS, {
    skip: projectID !== '' && projectID !== undefined,
    onCompleted: (data) => {
      if (data.listProjects) {
        data.listProjects.forEach((project): void => {
          project.members.forEach((member: Member): void => {
            if (member.user_id === userID && member.role === 'Owner') {
              setprojectID(project.id);
              setprojectRole(member.role);
              history.push({
                pathname: `/${baseRoute}`,
                search: `?projectID=${project.id}&projectRole=${member.role}`,
              });
            }
          });
        });
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  history.listen((location) => {
    console.log('outside location condn');
    if (location.pathname !== '/login') {
      console.log('inside location condn');
      setprojectID(getProjectID());
      setprojectRole(getProjectRole());
    }
  });

  if (getToken() === '') {
    return (
      <Switch>
        {console.log('no token-app hit')}

        <Route exact path="/login" component={LoginPage} />
        <Redirect exact path="/api-doc" to="/api-doc/index.html" />
        <Redirect to="/login" />
      </Switch>
    );
  }

  if (!projectID) {
    return (
      <Switch>
        {console.log('no project app hit')}
        <Route exact path="/getStarted" component={GetStarted} />
        <Redirect exact path="/api-doc" to="/api-doc/index.html" />
        <Redirect to="/getStarted" />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route exact path="/home" component={HomePage} />
      <Redirect exact path="/" to="/home" />
      <Route exact path="/workflows" component={Workflows} />
      <Route exact path="/analytics" component={AnalyticsDashboard} />
      <Route
        exact
        path="/analytics/datasource/select"
        component={DataSourceSelectPage}
      />
      <Route
        exact
        path="/analytics/datasource/create"
        component={() => <DataSourceConfigurePage configure={false} />}
      />
      <Route
        exact
        path="/analytics/datasource/configure"
        component={() => <DataSourceConfigurePage configure />}
      />
      <Route
        exact
        path="/analytics/dashboard/select"
        component={DashboardSelectPage}
      />
      <Route
        exact
        path="/analytics/dashboard/create"
        component={() => <DashboardConfigurePage configure={false} />}
      />
      <Route
        exact
        path="/analytics/dashboard/configure"
        component={() => <DashboardConfigurePage configure />}
      />
      <Route
        exact
        path="/analytics/dashboard"
        component={() => <DashboardPage />}
      />
      <Route exact path="/create-workflow" component={CreateWorkflow} />

      <Route
        exact
        path="/workflows/:workflowRunId"
        component={WorkflowDetails}
      />
      <Route
        exact
        path="/workflows/schedule/:scheduleProjectID/:workflowName" // Check
        component={SchedulePage}
      />
      <Route
        exact
        path="/workflows/template/:templateName"
        component={BrowseTemplate}
      />
      <Route
        exact
        path="/workflows/analytics/:workflowRunId"
        component={AnalyticsPage}
      />
      <Route exact path="/community" component={Community} />
      <Route exact path="/targets" component={Targets} />
      <Route exact path="/target-connect" component={ConnectTargets} />
      <Route exact path="/myhub" component={MyHub} />
      <Route exact path="/myhub/connect" component={MyHubConnect} />
      <Route exact path="/myhub/edit/:hubname" component={MyHubEdit} />
      <Route exact path="/myhub/:hubname" component={ChaosChart} />
      <Route
        exact
        path="/myhub/:hubname/:chart/:experiment"
        component={MyHubExperiment}
      />
      <Route
        exact
        path="/create-workflow/custom"
        component={CreateCustomWorkflow}
      />
      {projectRole === 'Owner' ? (
        <Route path="/settings" component={Settings} />
      ) : (
        <Redirect
          to={{
            pathname: '/home',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          }}
        />
      )}
      <Route exact path="/404" component={ErrorPage} />

      {/* Redirects */}
      <Redirect exact path="/workflows/schedule" to="/workflows" />
      <Redirect exact path="/workflows/template" to="/workflows" />

      <Redirect exact path="/analytics/overview" to="/analytics" />
      <Redirect exact path="/analytics/litmusdashboard" to="/analytics" />
      <Redirect exact path="/analytics/kubernetesdashborad" to="/analytics" />
      <Redirect exact path="/analytics/datasource" to="/analytics" />
      <Redirect exact path="/api-doc" to="/api-doc/index.html" />
      <Redirect to="/404" />
    </Switch>
  );
};

function App() {
  const analyticsAction = useActions(AnalyticsActions);
  const token = getToken();
  useEffect(() => {
    if (token !== '') {
      analyticsAction.loadCommunityAnalytics();
    }
  }, [token]);
  return (
    <LitmusThemeProvider>
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <Router history={history}>
          {/* <Routes /> */}
          <Routes />
        </Router>
      </Suspense>
    </LitmusThemeProvider>
  );
}

export default App;
