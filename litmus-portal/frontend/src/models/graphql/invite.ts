export interface UserInvite {
  _id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  deactivatedAt: string;
}

// Invitation status for users
export enum InvitationStatus {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
  EXITED = 'EXITED',
}
