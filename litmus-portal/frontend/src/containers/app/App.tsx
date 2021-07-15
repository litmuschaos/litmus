import { useQuery } from '@apollo/client';
import { LitmusThemeProvider } from 'litmus-ui';
import React, { lazy, useState } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import { GET_PROJECT, LIST_PROJECTS } from '../../graphql';
import {
  Member,
  ProjectDetail,
  Projects,
  UserRole,
} from '../../models/graphql/user';
import { history } from '../../redux/configureStore';
import { getToken, getUserId, getUserRole } from '../../utils/auth';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import Scaffold from '../layouts/Scaffold';

const ErrorPage = lazy(() => import('../../pages/ErrorPage'));
const Workflows = lazy(() => import('../../pages/Workflows'));
const CreateWorkflow = lazy(() => import('../../pages/CreateWorkflow'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const GetStarted = lazy(() => import('../../pages/GetStartedPage'));
const WorkflowDetails = lazy(() => import('../../pages/WorkflowDetails'));
const HomePage = lazy(() => import('../../pages/HomePage'));
const Community = lazy(() => import('../../pages/Community'));
const Settings = lazy(() => import('../../pages/Settings'));
const UsageStatistics = lazy(() => import('../../pages/UsageStatistics'));
const Targets = lazy(() => import('../../pages/Targets'));
const EditSchedule = lazy(() => import('../../pages/EditSchedule'));
const SetNewSchedule = lazy(() => import('../../pages/EditSchedule/Schedule'));
const ConnectTargets = lazy(() => import('../../pages/ConnectTarget'));
const WorkflowInfoStats = lazy(() => import('../../pages/WorkflowInfoStats'));
const AnalyticsDashboard = lazy(() => import('../../pages/AnalyticsPage'));
const DataSourceConfigurePage = lazy(
  () => import('../../pages/ConfigureDataSources')
);
const ChooseAndConfigureDashboards = lazy(
  () => import('../../pages/ChooseAndConfigureDashboards')
);
const DashboardPage = lazy(() => import('../../pages/ApplicationDashboard'));
const MyHub = lazy(() => import('../../pages/ChaosHub'));
const ChaosChart = lazy(() => import('../../views/MyHub/MyHubCharts'));
const MyHubExperiment = lazy(() => import('../../views/MyHub/MyHubExperiment'));

const Routes: React.FC = () => {
  const baseRoute = window.location.pathname
    .replace(process.env.PUBLIC_URL, '')
    .split('/')[1];

  const projectIDFromURL = getProjectID();
  const projectRoleFromURL = getProjectRole();
  const role = getUserRole();
  const [projectID, setprojectID] = useState<string>(projectIDFromURL);
  const [projectRole, setprojectRole] = useState<string>(projectRoleFromURL);
  const [isProjectMember, setIsProjectMember] = useState<boolean>(false);
  const userID = getUserId();

  const { loading } = useQuery<Projects>(LIST_PROJECTS, {
    skip: (projectID !== '' && projectID !== undefined) || getToken() === '',
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
    if (location.pathname !== '/login') {
      setprojectID(getProjectID());
      setprojectRole(getProjectRole());
    }
  });

  const { loading: projectValidation } = useQuery<ProjectDetail>(GET_PROJECT, {
    skip: getToken() === '',
    variables: { projectID },
    onCompleted: (data) => {
      if (data?.getProject) {
        data.getProject.members.forEach((member: Member) => {
          if (member.user_id === userID) {
            setIsProjectMember(true);
            setprojectID(data.getProject.id);
            setprojectRole(member.role);
          }
        });
        if (!isProjectMember) {
          setprojectID('');
          setprojectRole('');
        }
      }
    },
    onError: () => {
      if (!isProjectMember) {
        setprojectID('');
        setprojectRole('');
      }
    },
  });

  if (getToken() === '') {
    return (
      <SuspenseLoader style={{ height: '80vh' }}>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Redirect exact path="/api-doc" to="/api-doc/index.html" />
          <Redirect to="/login" />
        </Switch>
      </SuspenseLoader>
    );
  }

  if (!projectID) {
    return (
      <>
        {!loading && (
          <SuspenseLoader style={{ height: '80vh' }}>
            <Switch>
              <Route exact path="/getStarted" component={GetStarted} />
              <Route exact path="/login" component={LoginPage} />
              <Redirect exact path="/api-doc" to="/api-doc/index.html" />
              <Redirect to="/getStarted" />
            </Switch>
          </SuspenseLoader>
        )}
      </>
    );
  }

  return (
    <>
      {!projectValidation && !loading && (
        <Scaffold>
          <SuspenseLoader style={{ height: '80vh' }}>
            <Switch>
              <Route exact path="/home" component={HomePage} />
              <Redirect exact path="/" to="/home" />
              <Route exact path="/workflows" component={Workflows} />
              <Route exact path="/analytics" component={AnalyticsDashboard} />
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
                path="/analytics/dashboard/create"
                component={() => (
                  <ChooseAndConfigureDashboards configure={false} />
                )}
              />
              <Route
                exact
                path="/analytics/dashboard/configure"
                component={() => <ChooseAndConfigureDashboards configure />}
              />
              <Route
                exact
                path="/analytics/application-dashboard"
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
                path="/workflows/schedule/:scheduleProjectID/:workflowName"
                component={EditSchedule}
              />
              <Route
                exact
                path="/workflows/schedule/:scheduleProjectID/:workflowName/set"
                component={SetNewSchedule}
              />
              <Route
                exact
                path="/analytics/workflowdashboard/:workflowId"
                component={WorkflowInfoStats}
              />
              <Route exact path="/community" component={Community} />
              <Route exact path="/targets" component={Targets} />
              <Route exact path="/target-connect" component={ConnectTargets} />
              <Route exact path="/myhub" component={MyHub} />
              <Route exact path="/myhub/:hubname" component={ChaosChart} />
              <Route
                exact
                path="/myhub/:hubname/:chart/:experiment"
                component={MyHubExperiment}
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
              {role === UserRole.admin ? (
                <Route path="/usage-statistics" component={UsageStatistics} />
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
              <Redirect exact path="/getStarted" to="/home" />
              <Redirect exact path="/workflows/schedule" to="/workflows" />
              <Redirect exact path="/workflows/template" to="/workflows" />
              <Redirect exact path="/analytics/overview" to="/analytics" />
              <Redirect
                exact
                path="/analytics/litmusdashboard"
                to="/analytics"
              />
              <Redirect exact path="/analytics/datasource" to="/analytics" />
              <Redirect exact path="/analytics/dashboard" to="/analytics" />
              <Redirect exact path="/api-doc" to="/api-doc/index.html" />
              <Redirect to="/404" />
            </Switch>
          </SuspenseLoader>
        </Scaffold>
      )}
    </>
  );
};

function App() {
  return (
    <LitmusThemeProvider>
      <Router history={history}>
        {/* <Routes /> */}
        <Routes />
      </Router>
    </LitmusThemeProvider>
  );
}

export default App;
