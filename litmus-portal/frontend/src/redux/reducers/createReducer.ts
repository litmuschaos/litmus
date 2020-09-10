/* eslint-disable no-prototype-builtins */
import { Reducer } from 'redux';
import { Action } from '../../models/redux';

export default function createReducer<S>(
  initialState: S,
  handlers: any
): Reducer<S> {
  const r = (state: S = initialState, action: Action): S => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };

  return r as Reducer<S>;
}
