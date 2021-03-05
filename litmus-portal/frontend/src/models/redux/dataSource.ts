export interface DataSourceData {
  selectedDataSourceID: string;
  selectedDataSourceURL: string;
  selectedDataSourceName?: string;
  selectedDataSourceTemplateID?: number;
}

export enum DataSourceSelectionActions {
  SELECT_DATASOURCE = 'SELECT_DATASOURCE',
}

interface DataSourceSelectionActionType<T, P> {
  type: T;
  payload: P;
}

export type DataSourceSelectionAction = DataSourceSelectionActionType<
  typeof DataSourceSelectionActions.SELECT_DATASOURCE,
  DataSourceData
>;
