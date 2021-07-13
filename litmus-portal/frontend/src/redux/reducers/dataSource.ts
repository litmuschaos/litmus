/* eslint-disable import/prefer-default-export */
import {
  DataSourceData,
  DataSourceSelectionAction,
  DataSourceSelectionActions,
} from '../../models/redux/dataSource';
import createReducer from './createReducer';

const initialState: DataSourceData = {
  selectedDataSourceID: '',
  selectedDataSourceName: '',
};

export const selectDataSource = createReducer<DataSourceData>(initialState, {
  [DataSourceSelectionActions.SELECT_DATASOURCE](
    state: DataSourceData,
    action: DataSourceSelectionAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default selectDataSource;
