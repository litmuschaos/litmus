import type { Probe } from '@api/entities';

export function generateChaosProbesDashboardTableContent(probeData: Array<Probe>): Array<Partial<Probe>> {
  const content: Partial<Probe>[] = probeData.map(probe => ({
    name: probe.name,
    type: probe.type,
    infrastructureType: probe.infrastructureType,
    recentExecutions: probe.recentExecutions,
    referencedBy: probe.referencedBy,
    updatedBy: probe.updatedBy,
    updatedAt: parseInt(probe.updatedAt ?? '').toString()
  }));
  return content;
}
