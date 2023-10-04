import type { CollapsableSelectOptions } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import type { FormikHelpers } from 'formik';
import type { ExperimentMetadata } from '@db';
import { InfraScope, InfrastructureUpdateStatus } from '@api/entities';

/* 
  Generic
*/

export function getChaosInfrastructureStatus(
  isActive: boolean | undefined,
  isInfraConfirmed: boolean | undefined,
  updateStatus?: InfrastructureUpdateStatus
): ChaosInfrastructureStatus {
  if (isActive === undefined || isInfraConfirmed === undefined) {
    return ChaosInfrastructureStatus.INACTIVE;
  } else if (!isInfraConfirmed && !isActive) {
    return ChaosInfrastructureStatus.PENDING;
  } else if (isInfraConfirmed && updateStatus === InfrastructureUpdateStatus.MANDATORY) {
    return ChaosInfrastructureStatus.UPGRADE_NEEDED;
  } else if (isInfraConfirmed && !isActive) {
    return ChaosInfrastructureStatus.INACTIVE;
  } else if (isInfraConfirmed && isActive) {
    return ChaosInfrastructureStatus.ACTIVE;
  } else {
    return ChaosInfrastructureStatus.INACTIVE;
  }
}

export interface ChaosInfrastructureReferenceFieldProps {
  setFieldValue: FormikHelpers<ExperimentMetadata>['setFieldValue'];
  initialInfrastructureID: string | undefined;
}

export enum DeploymentScopeOptions {
  CLUSTER = 'cluster',
  NAMESPACE = 'namespace'
}

export enum ChaosInfrastructureStatus {
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  ACTIVE = 'CONNECTED',
  UPGRADE_NEEDED = 'UPGRADE NEEDED'
}

export enum EnvironmentType {
  PRODUCTION = 'Production',
  NON_PRODUCTION = 'PreProduction'
}
export interface InitialValueProps {
  infraScope: DeploymentScopeOptions;
  name: string;
  description: string;
  tags?: Array<string>;
  chaosInfrastructureNamespace: string;
  serviceAccountName: string;
  addHarnessInfrastructure: boolean; // not in API
  skipSSLCheck: boolean;
  addNodeselector: boolean;
  nodeSelectorValues?: Array<NodeSelector>;
  tolerations: boolean;
  tolerationValues?: Array<Toleration>;
}

export interface DeploymentScopeItem extends CollapsableSelectOptions {
  type: DeploymentScopeOptions;
  name: string;
  description: string;
  iconName: IconName;
  tooltipId?: string;
}

export interface Toleration {
  tolerationSeconds?: number;
  key?: string;
  operator?: string;
  effect?: string;
  value?: string;
}

export interface NodeSelector {
  key: string;
  value: string;
}

export interface KubernetesInfrastructureFilterInput {
  name?: string;
  infraID?: string;
  description?: string;
  platformName?: string;
  infraScope?: InfraScope;
  isActive?: boolean;
  tags?: Array<string>;
}

export const initialValues: InitialValueProps = {
  infraScope: DeploymentScopeOptions.CLUSTER,
  name: '',
  description: '',
  chaosInfrastructureNamespace: 'litmus',
  serviceAccountName: 'litmus',
  addHarnessInfrastructure: false,
  skipSSLCheck: false,
  addNodeselector: false,
  nodeSelectorValues: [{ key: '', value: '' }],
  tolerations: false,
  tolerationValues: [
    {
      tolerationSeconds: 0,
      key: '',
      operator: '',
      effect: '',
      value: ''
    }
  ]
};

export const kubernetesChaosInfrastructureCRDsEndpoint =
  'https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/3.0.0-beta10/litmus-portal-crds-3.0.0-beta10.yml';

type InfrastructurePlatformNameType = 'Kubernetes';

export interface InfrastructurePlatform extends CollapsableSelectOptions {
  name: InfrastructurePlatformNameType;
  image: IconName;
  count: number | undefined;
  isActive: boolean;
  supportedFaults: Array<IconName>;
}
