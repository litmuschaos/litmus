/**
 * Created by toni on 12.03.2017.
 */
import { Reducer } from "redux";
import { Action } from "../../models";

export default function createReducer<S>(
	initialState: S,
	handlers: any
): Reducer<S> {
	const r = (state: S = initialState, action: Action): S => {
		if (handlers.hasOwnProperty(action.type)) {
			return handlers[action.type](state, action);
		} else {
			return state;
		}
	};

	return r as Reducer<S>;
}
