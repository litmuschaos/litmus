import React from 'react';
import type { MembersResponse } from '@api/entities/project';
import type { ProjectMember } from './types';

export function generateActiveMemberTableContent(memberData: Array<MembersResponse> | undefined): Array<ProjectMember> {
  //   const [content, setContent] = React.useState<ProjectMember[]>([]);
  console.log('memberData', memberData);
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

  // memberData.length > 0
  //   ? memberData.map(member => {
  //       return {
  //         UserID: member.UserID,
  //         Invitation: member.Invitation,
  //         JoinedAt: member.JoinedAt,
  //         Role: member.Role
  //       };
  //     })
  //   : [];

  console.log(content);

  return content;
}
