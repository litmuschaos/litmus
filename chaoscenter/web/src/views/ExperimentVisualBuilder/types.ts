import type { ChaosEngine, ChaosExperiment } from '@models';

export interface FaultData {
  faultName: string;
  faultCR?: ChaosExperiment;
  engineCR?: ChaosEngine;
}
