import type { Members } from '@api/entities/project';
import type { ProjectMember } from './types';

export function generateActiveMemberTableContent(memberData: Array<Members> | undefined): Array<ProjectMember> {
  const content: Array<ProjectMember> =
    memberData && memberData?.length > 0
      ? memberData.map(member => {
          return {
            UserID: member.userID,
            Name: member.name,
            Username: member.username,
            Email: member.email,
            Invitation: member.invitation,
            JoinedAt: member.joinedAt,
            Role: member.role
          };
        })
      : [];

  return content;
}
