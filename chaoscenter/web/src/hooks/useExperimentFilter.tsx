import React, { Dispatch } from 'react';
import type { DateRange, ExperimentListType, InfrastructureType } from '@api/entities';

export enum ExperimentFilterActionKind {
  CHANGE_EXPERIMENT_NAME = 'CHANGE_EXPERIMENT_NAME',
  CHANGE_INFRA_TYPE = 'CHANGE_INFRA_TYPE',
  CHANGE_INFRA_ID = 'CHANGE_INFRA_ID',
  CHANGE_DATE_RANGE = 'CHANGE_DATE_RANGE',
  CHANGE_SCHEDULE_TYPE = 'CHANGE_SCHEDULE_TYPE',
  RESET_FILTERS = 'RESET_FILTERS'
}

// <!-- TODO: take this type from @api/entities once backend filters are finalised -->
export interface ExperimentFilter {
  experimentName?: string | undefined;
  infraType?: Array<InfrastructureType>;
  infraID?: string | undefined;
  dateRange?: DateRange | undefined;
  schedule?: ExperimentListType | undefined;
}

export interface ExperimentFilterAction {
  type: ExperimentFilterActionKind;
  payload: ExperimentFilter;
}

interface ReducerReturn {
  state: ExperimentFilter;
  dispatch: Dispatch<ExperimentFilterAction>;
}

function reducer(state: ExperimentFilter, action: ExperimentFilterAction): ReducerReturn['state'] {
  switch (action.type) {
    case ExperimentFilterActionKind.CHANGE_EXPERIMENT_NAME:
      return { ...state, experimentName: action.payload.experimentName };
    case ExperimentFilterActionKind.CHANGE_INFRA_ID:
      return { ...state, infraID: action.payload.infraID };
    case ExperimentFilterActionKind.CHANGE_DATE_RANGE:
      return { ...state, dateRange: action.payload.dateRange };
    case ExperimentFilterActionKind.CHANGE_INFRA_TYPE:
      return { ...state, infraType: action.payload.infraType };
    case ExperimentFilterActionKind.CHANGE_SCHEDULE_TYPE:
      return { ...state, schedule: action.payload.schedule };
    case ExperimentFilterActionKind.RESET_FILTERS:
      return { ...initialExperimentFilterState };
    default:
      throw new Error();
  }
}

export const initialExperimentFilterState: ExperimentFilter = {
  experimentName: '',
  infraType: undefined,
  infraID: undefined,
  schedule: undefined,
  dateRange: undefined
};

export function useExperimentFilter(): ReducerReturn {
  const [state, dispatch] = React.useReducer(reducer, initialExperimentFilterState);

  return { state, dispatch };
}
