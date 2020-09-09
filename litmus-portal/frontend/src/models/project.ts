export interface Member {
  user_id: string;
  user_name: string;
  role: string;
  invitation: string;
  name: string;
  email: string;
  joined_at: string;
}

export interface Project {
  members: Member[];
  name: string;
  id: string;
}
