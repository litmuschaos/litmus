import { constants } from '../../../../constants';

export const gvrData = [
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.deployment,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.statefulset,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.daemonset,
  },
  {
    group: constants.openshift,
    version: constants.v1,
    resource: constants.deploymentconfig,
  },
  {
    group: constants.argoproj,
    version: constants.v1alpha1,
    resource: constants.rollout,
  },
];
