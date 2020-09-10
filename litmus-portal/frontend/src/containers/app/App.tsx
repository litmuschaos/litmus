import React, { lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import Loader from '../../components/Loader';
import { UserData } from '../../models/redux/user';
import useActions from '../../redux/actions';
import * as AnalyticsActions from '../../redux/actions/analytics';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import withTheme from '../../theme';
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
const SchedulePage = lazy(() => import('../../pages/SchedulePage'));
interface RoutesProps {
  userData: UserData;
  isProjectAvailable: boolean;
}

const Routes: React.FC<RoutesProps> = ({ userData, isProjectAvailable }) => {
  const classes = useStyles();
  if (userData.token === '') {
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
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/workflows" component={Workflows} />
        <Route exact path="/create-workflow" component={CreateWorkflow} />

        {/* Redirects */}
        <Redirect exact path="/workflows/details" to="/workflows" />
        <Redirect exact path="/workflows/schedule" to="/workflows" />
        <Redirect exact path="/workflows/template" to="/workflows" />
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
        <Route exact path="/community" component={Community} />
        {userData.userRole === 'Owner' ? (
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
  const userData = useSelector((state: RootState) => state.userData);
  useEffect(() => {
    if (userData.token !== '') analyticsAction.loadCommunityAnalytics();
  }, [userData.token]);
  return (
    <Suspense fallback={<Loader />}>
      <Router history={history}>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            {/* <Routes /> */}
            <Routes
              userData={userData}
              isProjectAvailable={!!userData.selectedProjectID}
            />
          </div>
        </div>
      </Router>
    </Suspense>
  );
}

export default withTheme(App);
