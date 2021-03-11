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
}
