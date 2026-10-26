import type { ExperimentRunStatus, RecentExperimentRun, Experiment } from '@api/entities';
import type { ExperimentDetails, RecentExecutions } from './types';

function generateRecentExecutionsData(experimentRuns: Array<RecentExperimentRun> | undefined): Array<RecentExecutions> {
  return experimentRuns
    ? experimentRuns.map(individualRun => {
        return {
          experimentRunID: individualRun.experimentRunID,
          resilienceScore: individualRun.resiliencyScore,
          experimentRunStatus: individualRun.phase as ExperimentRunStatus,
          executedBy: individualRun.updatedBy,
          executedAt: parseInt(individualRun.updatedAt ?? '')
        };
      })
    : [];
}

export function generateExperimentDashboardTableContent(experimentData: Array<Experiment>): Array<ExperimentDetails> {
  const content: ExperimentDetails[] = experimentData.map(individualExperiment => {
    return {
      experimentID: individualExperiment.experimentID,
      experimentName: individualExperiment.name,
      experimentTags: individualExperiment.tags,
      experimentManifest: individualExperiment.experimentManifest,
      cronSyntax: individualExperiment.cronSyntax !== '' ? individualExperiment.cronSyntax : false,
      infrastructure: {
        name: individualExperiment.infra?.name,
        type: individualExperiment.infra?.infraType,
        environmentID: individualExperiment.infra?.environmentID,
        infrastructureID: individualExperiment.infra?.infraID
      },
      recentExecutions: individualExperiment.recentExperimentRunDetails
        ? generateRecentExecutionsData(individualExperiment.recentExperimentRunDetails)
        : [],
      updatedBy: individualExperiment.updatedBy,
      updatedAt: parseInt(individualExperiment.updatedAt ?? ''),
      ExperimentType: individualExperiment.experimentType
    };
  });
  return content;
}
