declare namespace ExecutionStatusLabelModuleScssNamespace {
  export interface IExecutionStatusLabelModuleScss {
    aborted: string;
    approvalrejected: string;
    approvalwaiting: string;
    asyncwaiting: string;
    discontinuing: string;
    errored: string;
    expired: string;
    failed: string;
    icon: string;
    ignorefailed: string;
    interventionwaiting: string;
    notstarted: string;
    paused: string;
    pausing: string;
    queued: string;
    rejected: string;
    resourcewaiting: string;
    running: string;
    skipped: string;
    status: string;
    success: string;
    suspended: string;
    taskwaiting: string;
    timedwaiting: string;
  }
}

declare const ExecutionStatusLabelModuleScssModule: ExecutionStatusLabelModuleScssNamespace.IExecutionStatusLabelModuleScss;

export = ExecutionStatusLabelModuleScssModule;
