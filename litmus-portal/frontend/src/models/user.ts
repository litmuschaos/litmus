import { Project } from './project';

export interface UserData {
  selectedProjectID?: string;
  username: string;
  exp: number;
  token: string;
}

export interface UserDetails {
  username: string;
  projects: Project[];
  name: string;
  email: string;
  company_name: string;
  updated_at: string;
  created_at: string;
  removed_at: string;
  is_email_verified: string;
  state: string;
  role: string;
}

export interface CurrentUserDetails {
  getUser: UserDetails;
}

export enum UserActions {
  LOAD_USER_DETAILS = 'LOAD_USER_DETAILS',
  UPDATE_USER_DETAILS = 'UPDATE_USER_DETAILS',
  LOGOUT_USER = 'LOGOUT_USER',
}

interface UserActionType<T, P> {
  type: T;
  payload: P;
}

export type UserAction =
  | UserActionType<typeof UserActions.LOAD_USER_DETAILS, string>
  | UserActionType<typeof UserActions.LOGOUT_USER, string>
  | UserActionType<
      typeof UserActions.UPDATE_USER_DETAILS,
      {
        selectedProjectID: string;
      }
    >;
