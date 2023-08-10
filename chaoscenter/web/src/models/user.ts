export interface UserInfo {
  ID: string;
  username: string;
  userRole: string;
  email?: string;
  fullName?: string;
}

export enum UserType {
  ADMIN = 'admin',
  USER = 'user'
}
