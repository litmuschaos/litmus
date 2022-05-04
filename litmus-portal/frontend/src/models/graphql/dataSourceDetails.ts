export interface CreateDataSourceInput {
  DSInput: {
    ds_id?: string;
    ds_name: string;
    ds_type: string;
    ds_url: string;
    access_type: string;
    auth_type: string;
    basic_auth_username?: string;
    basic_auth_password?: string;
    scrape_interval: number;
    query_timeout: number;
    http_method: string;
    project_id?: string;
  };
}

export interface ListDataSourceResponse {
  ds_id: string;
  ds_name: string;
  ds_type: string;
  ds_url: string;
  access_type: string;
  auth_type: string;
  basic_auth_username: string;
  basic_auth_password: string;
  scrape_interval: number;
  query_timeout: number;
  http_method: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  health_status: string;
}

export interface deleteDSInput {
  force_delete: boolean;
  ds_id: string;
}

export interface DeleteDataSourceInput {
  projectID: string;
  deleteDSInput: deleteDSInput;
}
export interface ListDataSourceVars {
  projectID: string;
}

export interface DataSourceList {
  listDataSource: ListDataSourceResponse[];
}
