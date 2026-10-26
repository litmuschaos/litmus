import type { Probe } from '@api/entities';
import type { ChaosProbesSelectionProps } from './types';

export function generateChaosProbesSelectionDashboardTableContent(
  probeData: Array<Probe>
): Array<ChaosProbesSelectionProps> {
  const content: ChaosProbesSelectionProps[] = probeData.map(probe => ({
    probeName: probe.name,
    type: probe.type
  }));

  return content;
}
