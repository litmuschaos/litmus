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
  db_id?: string;
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

export interface CreateDashboardInput {
  createDBInput: {
    ds_id: string;
    db_name: string;
    db_type: string;
    panel_groups: PanelGroup[];
    end_time: string;
    start_time: string;
    project_id: string;
    cluster_id: string;
    refresh_rate: string;
  };
}

export interface updatePanelGroupInput {
  panel_group_name: string;
  panel_group_id: string;
}

export interface UpdateDashboardInput {
  updataDBInput: {
    db_id: string;
    ds_id: string;
    db_name: string;
    db_type: string;
    end_time: string;
    start_time: string;
    refresh_rate: string;
    panel_groups: updatePanelGroupInput[];
  };
}

export interface DeleteDashboardInput {
  dbID: string;
}

export interface UpdatePanelInput {
  panelInput: Panel[];
}

export interface ListDashboardResponse {
  db_id: string;
  ds_id: string;
  db_name: string;
  db_type: string;
  cluster_name: string;
  ds_name: string;
  ds_type: string;
  panel_groups: PanelGroupResponse[];
  end_time: string;
  start_time: string;
  refresh_rate: string;
  project_id: string;
  cluster_id: string;
  created_at: string;
  updated_at: string;
}

export interface ListDashboardVars {
  projectID: string;
}

export interface DashboardList {
  ListDashboard: ListDashboardResponse[];
}
