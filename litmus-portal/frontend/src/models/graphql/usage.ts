export interface ProjectData {
  projectID: string;
  workflows: {
    schedules: number;
    expRuns: number;
    runs: number;
  };
  agents: {
    total: number;
    ns: number;
    cluster: number;
  };
}

export interface AgentStat {
  ns: number;
  cluster: number;
  total: number;
  active: number;
}

export interface WorkflowStat {
  schedules: number;
  runs: number;
  expRuns: number;
}
export interface UsageData {
  totalCount: {
    projects: number;
    agents: AgentStat;
    workflows: WorkflowStat;
  };
  projects: ProjectData[];
}

export interface UsageStatsResponse {
  getUsageData: UsageData;
}
