export interface MemberInvitation {
  member: {
    project_id: string;
    user_name: string;
  };
}

export interface MemberInviteNew {
  member: {
    project_id: string;
    user_name: string;
    role: string;
  };
}

export interface UserInvite {
  id: string;
  name: string;
  username: string;
  email: string;
}
