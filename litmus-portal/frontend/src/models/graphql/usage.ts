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
  };
  projects: ProjectData[];
}

export interface UsageStats {
  usageQuery: UsageData;
}
