import { LitmusThemeProvider } from 'litmus-ui';
import React, { lazy, useEffect, useState } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import config from '../../config';
import { UserRole } from '../../models/graphql/user';
import { history } from '../../redux/configureStore';
import { getToken, getUserRole } from '../../utils/auth';
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
const ConnectTargets = lazy(() => import('../../pages/ConnectTarget'));
const WorkflowInfoStats = lazy(() => import('../../pages/WorkflowInfoStats'));
const ObservabilityDashboard = lazy(
  () => import('../../pages/ObservabilityPage')
);
// const DataSourceConfigurePage = lazy(
//   () => import('../../pages/ConfigureDataSources')
// );
// const ChooseAndConfigureDashboards = lazy(
//   () => import('../../pages/ChooseAndConfigureDashboards')
// );
// const DashboardPage = lazy(() => import('../../pages/MonitoringDashboard'));
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
  const [loading, setLoading] = useState<boolean>(false);

  const getOwnerProjects = () => {
    setLoading(true);
    fetch(`${config.auth.url}/get_owner_projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          setprojectID(data.data[0]);
          setprojectRole('Owner');
          history.push({
            pathname: `/${baseRoute}`,
            search: `?projectID=${data.data[0]}&projectRole=Owner`,
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!((projectID !== '' && projectID !== undefined) || getToken() === '')) {
      getOwnerProjects();
    }
  }, [projectID]);

  history.listen((location) => {
    if (location.pathname !== '/login') {
      setprojectID(getProjectID());
      setprojectRole(getProjectRole());
    }
  });

  const [projectValidation, setProjectValidation] = useState<boolean>(false);

  const getProjectValidation = () => {
    setProjectValidation(true);
    fetch(`${config.auth.url}/get_project_role/${projectID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          setprojectID('');
          setprojectRole('');
        }
        if (data.role !== 'N/A') {
          setprojectRole(data.role);
          if (data.role !== projectRole)
            history.push({
              pathname: `/${baseRoute}`,
              search: `?projectID=${projectID}&projectRole=${data.role}`,
            });
        } else {
          setprojectID('');
          setprojectRole('');
        }
        setProjectValidation(false);
      })
      .catch((err) => {
        console.error(err);
        setprojectID('');
        setprojectRole('');
      });
  };
  useEffect(() => {
    if (getToken() !== '' && projectID) {
      getProjectValidation();
    }
  }, []);

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
        <SuspenseLoader style={{ height: '80vh' }}>
          <Scaffold>
            <Switch>
              <Route exact path="/home" component={HomePage} />
              <Redirect exact path="/" to="/home" />
              <Route exact path="/scenarios" component={Workflows} />
              <Route
                exact
                path="/analytics"
                component={ObservabilityDashboard}
              />
              {/* <Route
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
                path="/analytics/monitoring-dashboard"
                component={() => <DashboardPage />}
              /> */}
              <Route exact path="/create-scenario" component={CreateWorkflow} />
              <Route
                exact
                path="/scenarios/:workflowRunID"
                component={WorkflowDetails}
              />
              <Route
                exact
                path="/scenarios/schedule/:scheduleProjectID/:workflowName"
                component={EditSchedule}
              />
              <Route
                exact
                path="/analytics/scenarioStatistics/:workflowID"
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
              {role === UserRole.ADMIN ? (
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
              <Redirect exact path="/scenarios/schedule" to="/scenarios" />
              <Redirect exact path="/scenarios/template" to="/scenarios" />
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
          </Scaffold>
        </SuspenseLoader>
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
