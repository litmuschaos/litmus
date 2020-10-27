import React, { lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import Loader from '../../components/Loader';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import * as MyHubActions from '../../redux/actions/myhub';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import withTheme from '../../theme';
import getToken from '../../utils/getToken';
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
const CreateCustomWorkflow = lazy(() =>
  import('../../views/CreateWorkflow/CustomWorkflow/CreateWorkflow')
);
const ScheduleCustomWorkflow = lazy(() =>
  import('../../views/CreateWorkflow/CustomWorkflow/ScheduleWorkflow')
);
const TuneCustomWorkflow = lazy(() =>
  import('../../views/CreateWorkflow/CustomWorkflow/TuneWorkflow')
);

interface RoutesProps {
  isOwner: boolean;
  isProjectAvailable: boolean;
}

const Routes: React.FC<RoutesProps> = ({ isOwner, isProjectAvailable }) => {
  const classes = useStyles();
  if (getToken() === '') {
    return (
      <div className={classes.content}>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route path="/" render={() => <Redirect to="/login" />} />
        </Switch>
      </div>
    );
  }

  if (!isProjectAvailable) {
    return (
      <div className={classes.content}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/" render={() => <Redirect to="/" />} />
        </Switch>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/workflows" component={Workflows} />
        <Route exact path="/create-workflow" component={CreateWorkflow} />

        {/* Redirects */}
        <Redirect exact path="/login" to="/" />
        <Redirect exact path="/workflows/details" to="/workflows" />
        <Redirect exact path="/workflows/schedule" to="/workflows" />
        <Redirect exact path="/workflows/template" to="/workflows" />
        <Redirect exact path="/workflows/analytics" to="/workflows" />
        <Route
          exact
          path="/workflows/details/:workflowRunId"
          component={WorkflowDetails}
        />
        <Route
          exact
          path="/workflows/schedule/:scheduleId"
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
        <Route exact path="/myhub/experiments" component={ChaosChart} />
        <Route
          exact
          path="/create-workflow/custom"
          component={CreateCustomWorkflow}
        />
        <Route
          exact
          path="/create-workflow/custom/tune"
          component={TuneCustomWorkflow}
        />
        <Route
          exact
          path="/create-workflow/custom/schedule"
          component={ScheduleCustomWorkflow}
        />
        {isOwner ? (
          <Route exact path="/settings" component={Settings} />
        ) : (
          <Redirect to="/" />
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
  const publicHubAction = useActions(MyHubActions);
  const userData = useSelector((state: RootState) => state.userData);
  const token = getToken();
  useEffect(() => {
    if (token !== '') {
      analyticsAction.loadCommunityAnalytics();
      publicHubAction.getAllPublicCharts();
    }
  }, [token]);

  return (
    <Suspense fallback={<Loader />}>
      <Router history={history}>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            {/* <Routes /> */}
            <Routes
              isOwner={userData.userRole === 'Owner'}
              isProjectAvailable={!!userData.selectedProjectID}
            />
          </div>
        </div>
      </Router>
    </Suspense>
  );
}

export default withTheme(App);
