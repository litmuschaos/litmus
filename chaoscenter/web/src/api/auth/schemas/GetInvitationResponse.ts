/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import type { ProjectMember } from '../schemas/ProjectMember';

export interface GetInvitationResponse {
  invitationRole: 'Editor' | 'Owner' | 'Viewer';
  projectID: string;
  projectName: string;
  projectOwner: ProjectMember;
}
