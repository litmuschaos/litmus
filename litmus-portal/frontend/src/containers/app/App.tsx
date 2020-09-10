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
  import('../../components/Sections/ChaosWorkflows/BrowseTemplate')
);
const HomePage = lazy(() => import('../../pages/HomePage'));
const Community = lazy(() => import('../../pages/Community'));
const Settings = lazy(() => import('../../pages/Settings'));
const SchedulePage = lazy(() => import('../../pages/SchedulePage'));
interface RoutesProps {
  userData: string;
  isProjectAvailable: boolean;
}

const Routes: React.FC<RoutesProps> = ({ userData, isProjectAvailable }) => {
  const classes = useStyles();
  if (userData === '') {
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
        <Route
          exact
          path="/workflows/:workflowName"
          component={WorkflowDetails}
        />
        <Route
          exact
          path="/workflows/:workflowName/details"
          component={WorkflowDetails}
        />
        <Route
          exact
          path="/workflows/:scheduleId/schedule"
          component={SchedulePage}
        />
        <Route
          exact
          path="/workflows/:templateName/template"
          component={BrowseTemplate}
        />
        <Route exact path="/community" component={Community} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/404" component={ErrorPage} />
        <Redirect to="/404" />
      </Switch>
    </div>
  );
};

function App() {
  const classes = useStyles();
  const analyticsAction = useActions(AnalyticsActions);
  const userData: UserData = useSelector((state: RootState) => state.userData);
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
              userData={userData.token}
              isProjectAvailable={!!userData.selectedProjectID}
            />
          </div>
        </div>
      </Router>
    </Suspense>
  );
}

export default withTheme(App);
