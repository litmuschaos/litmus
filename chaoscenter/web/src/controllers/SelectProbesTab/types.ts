import type { ProbeType } from '@api/entities';

export interface ChaosProbesSelectionProps {
  probeName: string;
  type: ProbeType;
}

export interface ChaosProbesSelectionTableProps {
  content: Array<ChaosProbesSelectionProps>;
}
