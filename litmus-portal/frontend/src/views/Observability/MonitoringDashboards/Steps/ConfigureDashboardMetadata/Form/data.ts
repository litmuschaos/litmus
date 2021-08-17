import { constants } from '../../../../../../constants';

export default [
  {
    group: '',
    version: constants.v1,
    resource: constants.pods,
  },
  {
    group: '',
    version: constants.v1,
    resource: constants.services,
  },
  {
    group: '',
    version: constants.v1,
    resource: constants.nodes,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.deployments,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.statefulsets,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.daemonsets,
  },
  {
    group: constants.apps,
    version: constants.v1,
    resource: constants.replicasets,
  },
  {
    group: constants.openshift,
    version: constants.v1,
    resource: constants.deploymentconfigs,
  },
  {
    group: constants.argoproj,
    version: constants.v1alpha1,
    resource: constants.rollouts,
  },
];
