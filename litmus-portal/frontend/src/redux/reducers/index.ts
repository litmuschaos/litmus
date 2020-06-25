import { History } from "history";
import { combineReducers } from "redux";
import { ChartData } from "../../models";
import * as chartReducer from "./charts";

export interface RootState {
	chartData: ChartData;
}

export default (history: History) =>
	combineReducers({
		...chartReducer,
	});
