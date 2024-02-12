import type { Audit, ResourceDetails, SortType } from './common';

export enum EnvironmentType {
  PROD = 'PROD',
  NON_PROD = 'NON_PROD'
}

export interface Environment extends Audit, ResourceDetails {
  projectID: string;
  environmentID: string;
  type: EnvironmentType;
  infraIDs: string[];
}

export interface EnvironmentFilterInput {
  name?: string;
  description?: string;
  type?: EnvironmentType;
  tags?: Array<string>;
}

export interface EnvironmentSortInput {
  field: SortType;
  ascending: boolean;
}
