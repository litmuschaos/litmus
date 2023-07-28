/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import type { ActionBy } from '../schemas/ActionBy';
import type { ProjectMember } from '../schemas/ProjectMember';

export interface Project {
  createAt?: number;
  createdBy?: ActionBy;
  isRemoved?: boolean;
  members?: ProjectMember[];
  name?: string;
  projectID?: string;
  state?: string;
  updatedAt?: number;
  updatedBy?: ActionBy;
}
