export interface ChaosHubStatsData {
  totalChaosHubs: number;
}

export interface InfraStatsData {
  totalInfrastructures: number;
  totalActiveInfrastructure: number;
  totalInactiveInfrastructures: number;
  totalConfirmedInfrastructure: number;
  totalNonConfirmedInfrastructures: number;
}

export interface ExperimentStatsData {
  totalExperiments: number;
  totalExpCategorizedByResiliencyScore: {
    count: number;
    id: number;
  }[];
}

export interface ExperimentRunStatsData {
  totalExperimentRuns: number;
  totalRunningExperimentRuns: number;
  totalCompletedExperimentRuns: number;
  totalTerminatedExperimentRuns: number;
  totalStoppedExperimentRuns: number;
  totalErroredExperimentRuns: number;
}
