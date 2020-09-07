export interface Member {
  user_id: string;
  user_name: string;
  role: string;
  invitation: string;
}

export interface Project {
  members: Member[];
  name: string;
  id: string;
}
