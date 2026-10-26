import type { Probe } from '@api/entities';
import type {
  ComparatorInfo,
  GetMethod,
  HTTPProbeInputs,
  NewCmdProbeInputs,
  PostMethod,
  PromProbeInputs
} from '@models';

export interface ProbePropertiesProps {
  kubernetesHTTPProperties?: Probe['kubernetesHTTPProperties'];
  promProperties?: Probe['promProperties'];
  k8sProperties?: Probe['k8sProperties'];
  kubernetesCMDProperties?: Probe['kubernetesCMDProperties'];
}

export type KubernetesProbeTableType = NonNullable<
  Probe['kubernetesHTTPProperties' | 'kubernetesCMDProperties' | 'k8sProperties' | 'promProperties']
>;

export type HTTPProbeDetailsType = HTTPProbeInputs | GetMethod | PostMethod;

export type PROMProbeDetailsType = PromProbeInputs | ComparatorInfo;

export type CMDProbeDetailsType = NewCmdProbeInputs | ComparatorInfo;
