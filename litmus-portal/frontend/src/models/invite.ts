export interface MemberInvitation {
  project_id: string;
  user_name: string;
}

export interface MemberInviteNew {
  project_id: string;
  user_name: string;
  role: string;
}
