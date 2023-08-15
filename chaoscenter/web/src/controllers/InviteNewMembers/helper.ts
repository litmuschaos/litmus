import type { User } from '@api/auth';
import type { InviteUserDetails } from './types';

export function generateInviteUsersTableContent(userData: Array<User> | undefined): Array<InviteUserDetails> {
  const content: Array<InviteUserDetails> =
    userData && userData.length > 0
      ? userData.map(user => {
          return {
            ID: user.userID,
            Username: user.username,
            Email: user.email ?? ''
          };
        })
      : [];
  return content;
}
