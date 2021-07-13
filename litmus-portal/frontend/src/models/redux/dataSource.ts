export interface DataSourceData {
  selectedDataSourceID: string;
  selectedDataSourceName: string;
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
