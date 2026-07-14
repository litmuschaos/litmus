import type { AddProbeRequest } from '@api/core';
import { InfrastructureType, ProbeType } from '@api/entities';

const sourceObj = {
  image: 'litmuschaos/go-runner:latest',
  inheritInputs: true
};

export const KUBERENTES_SYSTEM_PROBE_CONFIG: AddProbeRequest['request'] = {
  // Name
  name: 'System Probe',
  // Description
  description: 'A default system healthcheck probe',
  // Tags
  tags: ['default', 'healthcheck'],
  // Static type of the probe
  type: ProbeType.CMD,
  // Infrastructure type of the Probe
  infrastructureType: InfrastructureType.KUBERNETES,
  // Default properties of healthcheck system probe
  kubernetesCMDProperties: {
    //ProbeTimeout contains timeout for the probe
    probeTimeout: '180s',
    // Interval contains the interval for the probe
    interval: '1s',
    // Attempt contains the attempt count for the probe
    attempt: 0,
    // Retry contains the retry count for the probe
    retry: 0,
    // Command need to be executed for the probe
    command: './healthcheck',
    // Comparator check for the correctness of the probe output
    comparator: {
      // type of data
      // it can be int, float, string
      type: 'string',
      // Criteria for matching data
      // it supports >=, <=, ==, >, <, != for int and float
      // it supports equal, notEqual, contains for string
      criteria: 'contains',
      // Value contains relative value for criteria
      value: '[P000]'
    },
    source: JSON.stringify(sourceObj)
  }
};
