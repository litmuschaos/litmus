import React from 'react';
import type { DateRange, ExperimentRunFaultStatus } from '@api/entities';

export enum ExperimentRunFilterActionKind {
  CHANGE_DATE_RANGE = 'CHANGE_DATE_RANGE',
  CHANGE_RUN_ID = 'CHANGE_RUN_ID',
  CHANGE_RUN_STATUS = 'CHANGE_RUN_STATUS',
  RESET_FILTERS = 'RESET_FILTERS'
}

// <!-- TODO: take this type from @api/entities once backend filters are finalised -->
export interface ExperimentRunFilter {
  experimentRunStatus?: Array<ExperimentRunFaultStatus> | undefined;
  experimentRunID?: string | undefined;
  dateRange?: DateRange | undefined;
}

export interface ExperimentRunFilterAction {
  type: ExperimentRunFilterActionKind;
  payload: ExperimentRunFilter;
}

interface ReducerReturn {
  state: ExperimentRunFilter;
  dispatch: React.Dispatch<ExperimentRunFilterAction>;
}

function reducer(state: ExperimentRunFilter, action: ExperimentRunFilterAction): ReducerReturn['state'] {
  switch (action.type) {
    case ExperimentRunFilterActionKind.CHANGE_DATE_RANGE:
      return { ...state, dateRange: action.payload.dateRange };
    case ExperimentRunFilterActionKind.CHANGE_RUN_ID:
      return { ...state, experimentRunID: action.payload.experimentRunID };
    case ExperimentRunFilterActionKind.CHANGE_RUN_STATUS:
      return { ...state, experimentRunStatus: action.payload.experimentRunStatus };
    case ExperimentRunFilterActionKind.RESET_FILTERS:
      return { ...initialExperimentRunFilterState };
    default:
      throw new Error();
  }
}

export const initialExperimentRunFilterState: ExperimentRunFilter = {
  experimentRunID: '',
  experimentRunStatus: undefined,
  dateRange: undefined
};

export function useExperimentRunsFilter(): ReducerReturn {
  const [state, dispatch] = React.useReducer(reducer, initialExperimentRunFilterState);
  return { state, dispatch };
}
