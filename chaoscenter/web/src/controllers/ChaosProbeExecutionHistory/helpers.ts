import type { ProbeReference, RecentProbeRun } from '@api/entities';
import type { RecentExecutions, ReferenceTableProps } from './types';

function generateRecentExecutionsData(probeRuns: Array<RecentProbeRun> | undefined): Array<RecentExecutions> {
  return probeRuns
    ? probeRuns.map(individualRun => ({
        experimentID: individualRun.executedByExperiment.experimentID,
        experimentName: individualRun.executedByExperiment.experimentName,
        status: individualRun.status,
        updatedBy: individualRun.executedByExperiment.updatedBy,
        updatedAt: individualRun.executedByExperiment.updatedAt * 1000
      }))
    : [];
}

export function generateChaosProbesExecutionHistoryTableContent(probeData: ProbeReference): Array<ReferenceTableProps> {
  const content: ReferenceTableProps[] = probeData.recentExecutions.map(execution => ({
    totalRuns: probeData.totalRuns,
    faultName: execution.faultName,
    executionHistory: execution.executionHistory ? generateRecentExecutionsData(execution.executionHistory) : [],
    mode: execution.mode
  }));
  return content;
}
