import React, { useEffect } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { useLogout, useRouteDefinitionsMatch, useRouteWithBaseUrl } from '@hooks';
import { GenericErrorHandler } from '@errors';
import OverviewController from '@controllers/Overview';
import ChaosHubsController from '@controllers/ChaosHubs';
import ChaosStudioCreateController from '@controllers/ChaosStudioCreate';
import ChaosStudioEditController from '@controllers/ChaosStudioEdit';
import ExperimentDashboardV2Controller from '@controllers/ExperimentDashboardV2';
import ExperimentRunHistoryController from '@controllers/ExperimentRunHistory';
import ExperimentRunDetailsController from '@controllers/ExperimentRunDetails';
import ChaosHubController from '@controllers/ChaosHub';
import ChaosFaultController from '@controllers/ChaosFault';
import ChaosStudioCloneController from '@controllers/ChaosStudioClone';
import PredefinedExperimentController from '@controllers/PredefinedExperiment';
import KubernetesChaosInfrastructureController from '@controllers/KubernetesChaosInfrastructure';
import KubernetesChaosInfrastructureDetailsController from '@controllers/KubernetesChaosInfrastructureDetails';
import LoginController from '@controllers/Login';
import { getUserDetails } from '@utils';
import EnvironmentController from '@controllers/Environments';
import { isUserAuthenticated } from 'utils/auth';
import ImageRegistryController from '@controllers/ImageRegistry';
import GitopsController from '@controllers/Gitops';
import AccountSettingsController from '@controllers/AccountSettings';
import ProjectMembersView from '@views/ProjectMembers';
import ChaosProbesController from '@controllers/ChaosProbes';
import ChaosProbeController from '@controllers/ChaosProbe';

const experimentID = ':experimentID';
const runID = ':runID';
const hubID = ':hubID';
const experimentName = ':experimentName';
const faultName = ':faultName';
const environmentID = ':environmentID';
const chaosInfrastructureID = ':chaosInfrastructureID';
const experimentKey = ':experimentKey';
const notifyID = ':notifyID';
const probeName = ':probeName';

export function RoutesWithAuthentication(): React.ReactElement {
  const projectMatchPaths = useRouteDefinitionsMatch();
  const projectRenderPaths = useRouteWithBaseUrl();
  const accountMatchPaths = useRouteDefinitionsMatch('account');
  const accountRenderPaths = useRouteDefinitionsMatch('account');

  const { forceLogout } = useLogout();
  const { accessToken: token } = getUserDetails();

  useEffect(() => {
    if (!token || !isUserAuthenticated()) {
      forceLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Switch>
      <Redirect exact from={accountMatchPaths.toRoot()} to={accountRenderPaths.toAccountSettingsOverview()} />
      <Redirect exact from={projectMatchPaths.toRoot()} to={projectRenderPaths.toDashboard()} />
      <Route exact path={accountMatchPaths.toAccountSettingsOverview()} component={AccountSettingsController} />
      <Route exact path={projectMatchPaths.toDashboard()} component={OverviewController} />
      {/* Chaos Experiments */}
      <Route exact path={projectMatchPaths.toExperiments()} component={ExperimentDashboardV2Controller} />
      <Route
        exact
        path={projectMatchPaths.toNewExperiment({ experimentKey })}
        component={ChaosStudioCreateController}
      />
      <Route exact path={projectMatchPaths.toEditExperiment({ experimentKey })} component={ChaosStudioEditController} />
      <Route
        exact
        path={projectMatchPaths.toCloneExperiment({ experimentKey })}
        component={ChaosStudioCloneController}
      />
      <Route
        exact
        path={projectMatchPaths.toExperimentRunHistory({ experimentID })}
        component={ExperimentRunHistoryController}
      />
      <Route
        exact
        path={projectMatchPaths.toExperimentRunDetails({ experimentID, runID })}
        component={ExperimentRunDetailsController}
      />
      <Route
        exact
        path={projectMatchPaths.toExperimentRunDetailsViaNotifyID({ experimentID, notifyID })}
        component={ExperimentRunDetailsController}
      />
      {/* ChaosHubs */}
      <Route exact path={projectMatchPaths.toChaosHubs()} component={ChaosHubsController} />
      <Route exact path={projectMatchPaths.toChaosHub({ hubID })} component={ChaosHubController} />
      <Route
        path={projectMatchPaths.toPredefinedExperiment({ hubID, experimentName })}
        component={PredefinedExperimentController}
      />
      <Route exact path={projectMatchPaths.toChaosFault({ hubID, faultName })} component={ChaosFaultController} />
      {/*Environments */}
      <Route exact path={projectMatchPaths.toEnvironments()} component={EnvironmentController} />
      {/* Kubernetes Chaos Infrastructure */}
      <Redirect
        exact
        from={projectMatchPaths.toChaosInfrastructures({ environmentID })}
        to={projectRenderPaths.toKubernetesChaosInfrastructures({ environmentID })}
      />
      <Route
        exact
        path={projectMatchPaths.toKubernetesChaosInfrastructures({ environmentID })}
        component={KubernetesChaosInfrastructureController}
      />
      <Route
        exact
        path={projectMatchPaths.toKubernetesChaosInfrastructureDetails({ environmentID, chaosInfrastructureID })}
        component={KubernetesChaosInfrastructureDetailsController}
      />
      <Route exact path={projectMatchPaths.toChaosProbes()} component={ChaosProbesController} />
      <Route exact path={projectMatchPaths.toChaosProbe({ probeName })} component={ChaosProbeController} />
      <Route exact path={projectMatchPaths.toImageRegistry()} component={ImageRegistryController} />
      <Route exact path={projectMatchPaths.toGitops()} component={GitopsController} />
      {/* Project */}
      <Redirect exact from={projectMatchPaths.toProjectSetup()} to={projectRenderPaths.toProjectMembers()} />
      <Route exact path={projectMatchPaths.toProjectMembers()} component={ProjectMembersView} />
    </Switch>
  );
}

export function RoutesWithoutAuthentication(): React.ReactElement {
  const matchPaths = useRouteDefinitionsMatch('account');
  const renderPaths = useRouteWithBaseUrl('account');
  const { accessToken: token, projectID, accountID } = getUserDetails();
  const history = useHistory();

  React.useEffect(() => {
    if (token && isUserAuthenticated()) {
      history.push(`/account/${accountID}/project/${projectID}${renderPaths.toDashboard()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, token]);

  return (
    <Switch>
      <Redirect exact from={matchPaths.toRoot()} to={renderPaths.toLogin()} />
      <Route exact path={matchPaths.toLogin()} component={LoginController} />
      <Route path="*" component={GenericErrorHandler} />
    </Switch>
  );
}
