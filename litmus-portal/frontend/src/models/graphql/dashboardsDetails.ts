export interface PanelOption {
  points: boolean;
  grids: boolean;
  left_axis: boolean;
}

export interface PromQuery {
  queryid: string;
  prom_query_name: string;
  legend: string;
  resolution: string;
  minstep: string;
  line: boolean;
  close_area: boolean;
}

export interface Panel {
  panel_id?: string;
  created_at?: string;
  panel_group_id?: string;
  prom_queries: PromQuery[];
  panel_options: PanelOption;
  panel_name: string;
  y_axis_left: string;
  y_axis_right: string;
  x_axis_down: string;
  unit: string;
}

export interface PanelGroup {
  panel_group_id?: string;
  panel_group_name: string;
  panels: Panel[];
}

export interface PanelResponse {
  panel_id: string;
  created_at: string;
  prom_queries: PromQuery[];
  panel_options: PanelOption;
  panel_name: string;
  y_axis_left: string;
  y_axis_right: string;
  x_axis_down: string;
  unit: string;
}

export interface PanelGroupResponse {
  panels: PanelResponse[];
  panel_group_name: string;
  panel_group_id: string;
}

export interface Resource {
  kind: string;
  names: string[];
}

export interface ApplicationMetadata {
  namespace: string;
  applications: Resource[];
}

export interface CreateDashboardInput {
  createDBInput: {
    ds_id: string;
    db_name: string;
    db_type_id: string;
    db_type_name: string;
    db_information: string;
    chaos_event_query_template: string;
    chaos_verdict_query_template: string;
    application_metadata_map: ApplicationMetadata[];
    panel_groups: PanelGroup[];
    end_time: string;
    start_time: string;
    project_id: string;
    cluster_id: string;
    refresh_rate: string;
  };
  createDashBoard?: ListDashboardResponse;
}

export interface updatePanelGroupInput {
  panel_group_name: string;
  panel_group_id: string;
  panels: Panel[];
}

export interface UpdateDashboardInput {
  updateDBInput: {
    db_id: string;
    ds_id?: string;
    db_name?: string;
    db_type_id?: string;
    db_type_name?: string;
    db_information?: string;
    chaos_event_query_template?: string;
    chaos_verdict_query_template?: string;
    application_metadata_map?: ApplicationMetadata[];
    end_time?: string;
    start_time?: string;
    cluster_id?: string;
    refresh_rate?: string;
    panel_groups?: updatePanelGroupInput[];
  };
  chaosQueryUpdate: boolean;
}

export interface DeleteDashboardInput {
  dbID: string;
}

export interface UpdatePanelInput {
  panelInput: Panel[];
}

export interface PortalDashboardsVars {
  projectID: string;
  hubName: string;
}

export interface PortalDashboardsResponse {
  name: string;
  dashboard_data: string;
}

export interface PortalDashboardList {
  PortalDashboardData: PortalDashboardsResponse[];
}

export interface ResourceResponse {
  kind: string;
  names: string[];
}

export interface ApplicationMetadataResponse {
  namespace: string;
  applications: ResourceResponse[];
}

export interface ListDashboardResponse {
  db_id: string;
  ds_id: string;
  db_name: string;
  db_type: string;
  cluster_name: string;
  ds_name: string;
  ds_type: string;
  ds_url: string;
  ds_health_status: string;
  db_type_id: string;
  db_type_name: string;
  db_information: string;
  chaos_event_query_template: string;
  chaos_verdict_query_template: string;
  application_metadata_map: ApplicationMetadataResponse[];
  panel_groups: PanelGroupResponse[];
  end_time: string;
  start_time: string;
  refresh_rate: string;
  project_id: string;
  cluster_id: string;
  created_at: string;
  updated_at: string;
  viewed_at: string;
}

export interface ListDashboardVars {
  projectID: string;
  clusterID?: string;
  dbID?: string;
}

export interface DashboardList {
  ListDashboard: ListDashboardResponse[];
}
