export interface MemberInvitation {
  member: {
    project_id: string;
    user_id: string;
  };
}

export interface MemberInviteNew {
  member: {
    project_id: string;
    user_id: string;
    role: string;
  };
}

export interface UserInvite {
  id: string;
  name: string;
  username: string;
  email: string;
  created_at: string;
  deactivated_at: string;
}

// Invitation status for users
export enum InvitationStatus {
  accepted = 'Accepted',
  pending = 'Pending',
  declined = 'Declined',
  exited = 'Exited',
}
