export interface PanelOption {
  points: boolean;
  grids: boolean;
  leftAxis: boolean;
}

export interface PromQuery {
  queryID: string;
  promQueryName: string;
  legend: string;
  resolution: string;
  minstep: string;
  line: boolean;
  closeArea: boolean;
}

export interface Panel {
  panelID?: string;
  createdAt?: string;
  panelGroupID?: string;
  promQueries: PromQuery[];
  panelOptions: PanelOption;
  panelName: string;
  yAxisLeft: string;
  yAxisRight: string;
  xAxisDown: string;
  unit: string;
}

export interface PanelGroup {
  panelGroupID?: string;
  panelGroupName: string;
  panels: Panel[];
}

export interface PanelResponse {
  panelID: string;
  createdAt: string;
  promQueries: PromQuery[];
  panelOptions: PanelOption;
  panelName: string;
  yAxisLeft: string;
  yAxisRight: string;
  xAxisDown: string;
  unit: string;
}

export interface PanelGroupResponse {
  panels: PanelResponse[];
  panelGroupName: string;
  panelGroupID: string;
}

export interface Resource {
  kind: string;
  names: string[];
}

export interface ApplicationMetadata {
  namespace: string;
  applications: Resource[];
}

export interface CreateDashboardRequest {
  request: {
    dsID: string;
    dbName: string;
    dbTypeID: string;
    dbTypeName: string;
    dbInformation: string;
    chaosEventQueryTemplate: string;
    chaosVerdictQueryTemplate: string;
    applicationMetadataMap: ApplicationMetadata[];
    panelGroups: PanelGroup[];
    endTime: string;
    startTime: string;
    projectID: string;
    clusterID: string;
    refreshRate: string;
  };
  createDashBoard?: GetDashboardResponse;
}

export interface UpdatePanelGroupRequest {
  panelGroupID: string;
  panelGroupName: string;
  panels: Panel[];
}

export interface UpdateDashboardRequest {
  request: {
    dbID: string;
    dsID?: string;
    dbName?: string;
    dbTypeID?: string;
    dbTypeName?: string;
    dbInformation?: string;
    chaosEventQueryTemplate?: string;
    chaosVerdictQueryTemplate?: string;
    applicationMetadataMap?: ApplicationMetadata[];
    endTime?: string;
    startTime?: string;
    clusterID?: string;
    refreshRate?: string;
    panelGroups?: UpdatePanelGroupRequest[];
  };
  chaosQueryUpdate: boolean;
}

export interface DeleteDashboardRequest {
  projectID: string;
  dbID: string;
}

export interface UpdatePanelRequest {
  request: Panel[];
}

export interface PortalDashboardsRequest {
  projectID: string;
  hubName: string;
}

export interface PortalDashboardsResponse {
  name: string;
  dashboardData: string;
}

export interface GetPortalDashboard {
  portalDashboardData: PortalDashboardsResponse[];
}

export interface ResourceResponse {
  kind: string;
  names: string[];
}

export interface ApplicationMetadataResponse {
  namespace: string;
  applications: ResourceResponse[];
}

export interface GetDashboardResponse {
  dbID: string;
  dsID: string;
  dbName: string;
  dbType: string;
  clusterName: string;
  dsName: string;
  dsType: string;
  dsURL: string;
  dsHealthStatus: string;
  dbTypeID: string;
  dbTypeName: string;
  dbInformation: string;
  chaosEventQueryTemplate: string;
  chaosVerdictQueryTemplate: string;
  applicationMetadataMap: ApplicationMetadataResponse[];
  panelGroups: PanelGroupResponse[];
  endTime: string;
  startTime: string;
  refreshRate: string;
  projectID: string;
  clusterID: string;
  createdAt: string;
  updatedAt: string;
  viewedAt: string;
}

export interface GetDashboardRequest {
  projectID: string;
  clusterID?: string;
  dbID?: string;
}

export interface GetDashboard {
  getDashboard: GetDashboardResponse[];
}
