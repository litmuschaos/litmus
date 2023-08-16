import type { User } from '@api/auth';
import type { InviteUserDetails } from './types';

export function generateInviteUsersTableContent(userData: Array<User> | undefined): Array<InviteUserDetails> {
  const content: Array<InviteUserDetails> =
    userData && userData.length > 0
      ? userData.map(user => {
          return {
            id: user.userID,
            username: user.username,
            email: user.email ?? '',
            name: user.name ?? ''
          };
        })
      : [];
  return content;
}
