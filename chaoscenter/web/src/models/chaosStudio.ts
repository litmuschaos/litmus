export enum StudioMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  CLONE = 'CLONE'
}

export enum StudioTabs {
  OVERVIEW = 'OVERVIEW',
  BUILDER = 'BUILDER',
  SCHEDULE = 'SCHEDULE'
}

export interface StudioErrorState {
  OVERVIEW: boolean | undefined;
  BUILDER: boolean | undefined;
}
