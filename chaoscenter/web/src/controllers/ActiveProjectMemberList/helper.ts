import type { Members } from '@api/entities/project';
import type { ProjectMember } from './types';

export function generateActiveMemberTableContent(memberData: Array<Members> | undefined): Array<ProjectMember> {
  const content: Array<ProjectMember> =
    memberData && memberData?.length > 0
      ? memberData.map(member => {
          return {
            UserID: member.UserID,
            Invitation: member.Invitation,
            JoinedAt: member.JoinedAt,
            Role: member.Role
          };
        })
      : [];

  return content;
}
