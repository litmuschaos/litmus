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

interface ParamType {
  projectID: string;
}

interface RoutesProps {
  isOwner: boolean;
}

const Routes: React.FC<RoutesProps> = ({ isOwner }) => {
  const classes = useStyles();

  const baseRoute = window.location.pathname.split('/')[1];
  const projectIDFromURL = window.location.pathname.split('/')[2];
  const [projectID, setprojectID] = useState<string>(projectIDFromURL);
  const userID = getUserId();
  console.log('on App.tsx: ', projectID);

  useQuery<Projects>(LIST_PROJECTS, {
    skip: projectID ? true : false,
    onCompleted: (data) => {
      let isOwnerOfProject = false;
      if (data.listProjects) {
        data.listProjects.map((project) => {
          project.members.forEach((member: Member) => {
            if (member.user_id === userID && member.role === 'Owner') {
              const id = project.id;
              isOwnerOfProject = true;
              // window.location.assign(`/home/${id}`);
              setprojectID(id);
              history.push(`/${baseRoute}/${id}`);
            }
          });
        });
      }
    },
    fetchPolicy: 'no-cache',
  });

  if (getToken() === '') {
    return (
      <div className={classes.content}>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route
            exact
            path="/api-doc"
            render={() => <Redirect to="/api-doc/index.html" />}
          />
          <Redirect to="/login" />
        </Switch>
      </div>
    );
  }

  if (!projectID) {
    return (
      <div className={classes.content}>
        <Switch>
          <Route exact path="/home" component={HomePage} />
          <Route
            exact
            path="/api-doc"
            render={() => <Redirect to="/api-doc/index.html" />}
          />
          <Redirect to="/home" />
        </Switch>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <Switch>
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/home/:projectID" component={HomePage} />
        <Redirect exact path="/" to="/home" />
        <Route exact path="/workflows" component={Workflows} />
        <Route exact path="/workflows/:projectID" component={Workflows} />
        <Route
          exact
          path="/create-workflow/:projectID"
          component={CreateWorkflow}
        />
        <Route
          exact
          path="/api-doc"
          render={() => <Redirect to="/api-doc/index.html" />}
        />
        {/* Redirects */}
        <Redirect exact path="/login" to="/home" />
        <Redirect exact path="/workflows/schedule" to="/workflows/:projectID" />
        <Redirect exact path="/workflows/template" to="/workflows/:projectID" />
        <Redirect
          exact
          path="/workflows/analytics"
          to="/workflows/:projectID"
        />
        <Route
          exact
          path="/workflows/:projectID/:workflowRunId"
          component={WorkflowDetails}
        />
        <Route
          exact
          path="/workflows/:projectID/schedule/:scheduleProjectID/:workflowName" // Check
          component={SchedulePage}
        />
        <Route
          exact
          path="/workflows/:projectID/template/:templateName"
          component={BrowseTemplate}
        />
        <Route
          exact
          path="/workflows/:projectID/analytics/:workflowRunId"
          component={AnalyticsPage}
        />
        <Route exact path="/community/:projectID" component={Community} />
        <Route exact path="/targets/:projectID" component={TargetHome} />
        <Route
          exact
          path="/targets/:projectID/cluster"
          component={ClusterInfo}
        />
        <Route
          exact
          path="/target-connect/:projectID"
          component={ConnectTargets}
        />
        <Route exact path="/myhub/:projectID" component={MyHub} />
        <Route
          exact
          path="/myhub/:projectID/connect"
          component={MyHubConnect}
        />
        <Route exact path="/myhub/edit/:hubname" component={MyHubEdit} />
        <Route exact path="/myhub/:hubname" component={ChaosChart} />
        <Route
          exact
          path="/myhub/:projectID/:hubname/:chart/:experiment"
          component={MyHubExperiment}
        />
        <Route
          exact
          path="/create-workflow/:projectID/custom"
          component={CreateCustomWorkflow}
        />
        {/* TODO: check if possible on the settings page itself / efficient way to check here itself*/}
        {isOwner ? (
          <Route path="/settings/:projectID" component={Settings} />
        ) : (
          <Redirect to="/home/:projectID" />
        )}
        <Route exact path="/404" component={ErrorPage} />
        <Redirect to="/404" />
      </Switch>
    </div>
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
            <div className={classes.appFrame}>
              {/* <Routes /> */}
              <Routes isOwner={true} />
            </div>
          </div>
        </Router>
      </Suspense>
    </LitmusThemeProvider>
  );
}

export default App;
