import React, { Dispatch } from 'react';

export enum ProjectFilterActionKind {
  CHANGE_SORT_FIELD = 'CHANGE_SORT_FIELD',
  CHANGE_SORT_ASCENDING = 'CHANGE_SORT_ASCENDING',
  CHANGE_CREATED_BY_ME = 'CHANGE_CREATED_BY_ME',
  CHANGE_PROJECT_NAME = 'CHANGE_PROJECT_NAME',
  CHANGE_PAGE = 'CHANGE_PAGE',
  CHANGE_LIMIT = 'CHANGE_LIMIT',
  RESET_FILTERS = 'RESET_FILTERS'
}

export interface ProjectFilter {
  sortField?: 'name' | 'time';
  sortAscending?: boolean;
  createdByMe?: boolean;
  projectName?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFilterAction {
  type: ProjectFilterActionKind;
  payload: Partial<ProjectFilter>;
}

interface ReducerReturn {
  state: ProjectFilter;
  dispatch: Dispatch<ProjectFilterAction>;
}

function reducer(state: ProjectFilter, action: ProjectFilterAction): ProjectFilter {
  switch (action.type) {
    case ProjectFilterActionKind.CHANGE_SORT_FIELD:
      return { ...state, sortField: action.payload.sortField };
    case ProjectFilterActionKind.CHANGE_SORT_ASCENDING:
      return { ...state, sortAscending: action.payload.sortAscending };
    case ProjectFilterActionKind.CHANGE_CREATED_BY_ME:
      return { ...state, createdByMe: action.payload.createdByMe };
    case ProjectFilterActionKind.CHANGE_PROJECT_NAME:
      return { ...state, projectName: action.payload.projectName };
    case ProjectFilterActionKind.CHANGE_PAGE:
      return { ...state, page: action.payload.page };
    case ProjectFilterActionKind.CHANGE_LIMIT:
      return { ...state, limit: action.payload.limit };
    case ProjectFilterActionKind.RESET_FILTERS:
      return { ...initialProjectFilterState };
    default:
      throw new Error();
  }
}

export const initialProjectFilterState: ProjectFilter = {
  sortField: undefined,
  sortAscending: undefined,
  createdByMe: undefined,
  projectName: undefined,
  page: undefined,
  limit: undefined
};

export function useProjectFilter(): ReducerReturn {
  const [state, dispatch] = React.useReducer(reducer, initialProjectFilterState);

  return { state, dispatch };
}
