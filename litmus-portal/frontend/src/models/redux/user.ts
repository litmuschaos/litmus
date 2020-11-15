export interface UpdateUser {
  selectedProjectID: string;
  selectedProjectName: string;
  selectedProjectOwner: string;
  userRole: string;
  loader: boolean;
}

export interface UserData extends UpdateUser {
  username: string;
  name: string;
  email: string;
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
  | UserActionType<typeof UserActions.UPDATE_USER_DETAILS, UpdateUser>;
