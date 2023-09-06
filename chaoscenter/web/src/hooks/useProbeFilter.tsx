import React, { Dispatch } from 'react';
import type { DateRange, ProbeType } from '@api/entities';

export enum ProbeFilterActionKind {
  CHANGE_PROBE_NAME = 'CHANGE_PROBE_NAME',
  CHANGE_PROBE_TYPE = 'CHANGE_PROBE_TYPE',
  CHANGE_DATE_RANGE = 'CHANGE_DATE_RANGE',
  RESET_FILTERS = 'RESET_FILTERS'
}

// <!-- TODO: take this type from @api/entities once backend filters are finalised -->
export interface ProbeFilter {
  probeName?: string | undefined;
  probeType?: Array<ProbeType>;
  dateRange?: DateRange | undefined;
}

export interface ProbeFilterAction {
  type: ProbeFilterActionKind;
  payload: ProbeFilter;
}

interface ReducerReturn {
  state: ProbeFilter;
  dispatch: Dispatch<ProbeFilterAction>;
}

function reducer(state: ProbeFilter, action: ProbeFilterAction): ReducerReturn['state'] {
  switch (action.type) {
    case ProbeFilterActionKind.CHANGE_PROBE_NAME:
      return { ...state, probeName: action.payload.probeName };
    case ProbeFilterActionKind.CHANGE_DATE_RANGE:
      return { ...state, dateRange: action.payload.dateRange };
    case ProbeFilterActionKind.CHANGE_PROBE_TYPE:
      return { ...state, probeType: action.payload.probeType };
    case ProbeFilterActionKind.RESET_FILTERS:
      return { ...initialProbeFilterState };
    default:
      throw new Error();
  }
}

export const initialProbeFilterState: ProbeFilter = {
  probeName: '',
  probeType: undefined,
  dateRange: undefined
};

export function useProbeFilter(): ReducerReturn {
  const [state, dispatch] = React.useReducer(reducer, initialProbeFilterState);

  return { state, dispatch };
}
