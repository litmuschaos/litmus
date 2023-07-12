import type { Users } from '@api/entities/users';
import type { InviteUserDetails } from './types';

export function generateInviteUsersTableContent(userData: Array<Users> | undefined): Array<InviteUserDetails> {
  const content: Array<InviteUserDetails> =
    userData && userData?.length > 0
      ? userData.map(user => {
          return {
            ID: user.UserID,
            Username: user.Username,
            Email: user.Email
          };
        })
      : [];

  return content;
}
