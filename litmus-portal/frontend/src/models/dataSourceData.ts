export interface DataSourceData {
  datasourceID?: number;
  name?: string;
  urlToIcon?: string;
  description?: string;
  handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface DataSourceDetails {
  id?: string;
  name: string;
  dataSourceType: string;
  url: string;
  access: string;
  basicAuth: boolean;
  username: string;
  password: string;
  noAuth: boolean;
  withCredentials: boolean;
  tlsClientAuth: boolean;
  withCACert: boolean;
  scrapeInterval: string;
  queryTimeout: string;
  httpMethod: string;
}
