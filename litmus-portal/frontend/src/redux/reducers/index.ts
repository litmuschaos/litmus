import { History } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import { combineReducers } from 'redux';
import { ChartData } from '../../models';
import * as chartReducer from './charts';

export interface RootState {
  chartData: ChartData;
}

export default (
  history: History // eslint-disable-line @typescript-eslint/no-unused-vars
) =>
  combineReducers({
    ...chartReducer,
  });
