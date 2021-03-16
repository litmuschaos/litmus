import { useQuery } from '@apollo/client';
import { LitmusThemeProvider } from 'litmus-ui';
import React, { lazy, ReactNode, Suspense, useEffect, useState } from 'react';
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
import useStyles from './App-styles';

const ErrorPage = lazy(() => import('../../pages/ErrorPage'));
const Workflows = lazy(() => import('../../pages/Workflows'));
const CreateWorkflow = lazy(() => import('../../pages/CreateWorkflow'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const WorkflowDetails = lazy(() => import('../../pages/WorkflowDetails'));
const BrowseTemplate = lazy(() =>
  import('../../views/ChaosWorkflows/BrowseTemplate')
);
const HomePage = lazy(() => import('../../pages/HomePage'));
const Community = lazy(() => import('../../pages/Community'));
const Settings = lazy(() => import('../../pages/Settings'));
const TargetHome = lazy(() => import('../../components/Targets/ConnectHome'));
const ConnectTargets = lazy(() =>
  import('../../components/Targets/ConnectTarget')
);
const SchedulePage = lazy(() => import('../../pages/SchedulePage'));
const AnalyticsPage = lazy(() => import('../../pages/AnalyticsPage'));
const ClusterInfo = lazy(() => import('../../components/Targets/ClusterInfo'));
const MyHub = lazy(() => import('../../pages/MyHub'));
const MyHubConnect = lazy(() => import('../../views/MyHub/MyHubConnect'));
const ChaosChart = lazy(() => import('../../views/MyHub/MyHubCharts'));
const MyHubExperiment = lazy(() => import('../../views/MyHub/MyHubExperiment'));
const MyHubEdit = lazy(() => import('../../views/MyHub/MyHubEdit'));
const CreateCustomWorkflow = lazy(() =>
  import('../../pages/CreateCustomWorkflow')
);

const Routes: React.FC = () => {
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
    fetchPolicy: 'no-cache',
  });

  if (getToken() === '') {
    return (
      <>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route
            exact
            path="/api-doc"
            render={(): ReactNode => <Redirect to="/api-doc/index.html" />}
          />
          <Redirect to="/login" />
        </Switch>
      </>
    );
  }

  if (!projectID) {
    return (
      <>
        <Switch>
          <Route exact path="/home" component={HomePage} />
          <Route
            exact
            path="/api-doc"
            render={(): ReactNode => <Redirect to="/api-doc/index.html" />}
          />
          <Redirect to="/home" />
        </Switch>
      </>
    );
  }

  return (
    <>
      <Switch>
        <Route exact path="/home" component={HomePage} />
        <Redirect exact path="/" to="/home" />
        <Route exact path="/workflows" component={Workflows} />
        <Route exact path="/create-workflow" component={CreateWorkflow} />
        <Route
          exact
          path="/api-doc"
          render={() => <Redirect to="/api-doc/index.html" />}
        />
        {/* Redirects */}
        <Redirect exact path="/login" to="/login" />
        <Redirect exact path="/workflows/schedule" to="/workflows" />
        <Redirect exact path="/workflows/template" to="/workflows" />
        <Redirect exact path="/workflows/analytics" to="/workflows" />
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
        <Route exact path="/targets" component={TargetHome} />
        <Route exact path="/targets/cluster" component={ClusterInfo} />
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
          <Redirect to="/home" />
        )}
        <Route exact path="/404" component={ErrorPage} />
        <Redirect to="/404" />
      </Switch>
    </>
  );
};

function App() {
  const classes = useStyles();
  const analyticsAction = useActions(AnalyticsActions);
  const token = getToken();
  useEffect(() => {
    if (token !== '') {
      analyticsAction.loadCommunityAnalytics();
    }
  }, [token]);
  return (
    <LitmusThemeProvider platform="litmus-portal">
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <Router history={history}>
          <div className={classes.root}>
            {/* <Routes /> */}
            <Routes />
          </div>
        </Router>
      </Suspense>
    </LitmusThemeProvider>
  );
}

export default App;
