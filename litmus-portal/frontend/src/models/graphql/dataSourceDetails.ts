export interface CreateDataSourceInput {
  DSInput: {
    dsID?: string;
    dsName: string;
    dsType: string;
    dsURL: string;
    accessType: string;
    authType: string;
    basicAuthUsername?: string;
    basicAuthPassword?: string;
    scrapeInterval: number;
    queryTimeout: number;
    httpMethod: string;
    projectID?: string;
  };
}

export interface ListDataSourceResponse {
  dsID: string;
  dsName: string;
  dsType: string;
  dsURL: string;
  accessType: string;
  authType: string;
  basicAuthUsername: string;
  basicAuthPassword: string;
  scrapeInterval: number;
  queryTimeout: number;
  httpMethod: string;
  projectID: string;
  createdAt: string;
  updatedAt: string;
  healthStatus: string;
}

export interface deleteDSInput {
  forceDelete: boolean;
  dsID: string;
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
