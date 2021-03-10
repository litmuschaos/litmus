import {
  DataSourceData,
  DataSourceSelectionAction,
  DataSourceSelectionActions,
} from '../../models/redux/dataSource';

export const selectDataSource = (
  data: DataSourceData
): DataSourceSelectionAction => {
  return {
    type: DataSourceSelectionActions.SELECT_DATASOURCE,
    payload: data,
  };
};

export default selectDataSource;
