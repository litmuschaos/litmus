import type { ProjectMember } from '@api/auth';

export function generateActiveMemberTableContent(memberData: Array<ProjectMember> | undefined): Array<ProjectMember> {
  const content: Array<ProjectMember> =
    memberData && memberData?.length > 0
      ? memberData.map(member => {
          return {
            userID: member.userID,
            name: member.name,
            username: member.username,
            email: member.email,
            invitation: member.invitation,
            joinedAt: member.joinedAt,
            role: member.role
          };
        })
      : [];

  return content;
}
