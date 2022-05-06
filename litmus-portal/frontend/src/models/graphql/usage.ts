export interface ProjectData {
  projectID: string;
  workflows: {
    schedules: number;
    expRuns: number;
    runs: number;
  };
  agents: {
    total: number;
    NS: number;
    cluster: number;
  };
}

export interface UsageData {
  totalCount: {
    projects: number;
    agents: {
      ns: string;
      cluster: string;
      total: number;
    };
    workflows: {
      schedules: number;
      runs: number;
      expRuns: number;
    };
  };
  projects: ProjectData[];
}

export interface UsageStats {
  getUsageData: UsageData;
}
