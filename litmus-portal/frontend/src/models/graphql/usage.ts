export interface ProjectData {
  ProjectId: string;
  Workflows: {
    Schedules: number;
    ExpRuns: number;
    Runs: number;
  };
  Agents: {
    Total: number;
    Ns: number;
    Cluster: number;
  };
}

export interface UsageData {
  TotalCount: {
    Projects: number;
  };
  Projects: ProjectData[];
}

export interface UsageStats {
  UsageQuery: UsageData;
}
