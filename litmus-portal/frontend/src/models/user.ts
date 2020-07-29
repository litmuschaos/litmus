export interface UserData {
  name: string;
  email: string;
  projectName: string;
  username: string;
  exp: number;
  token: string;
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
      { name: string; email: string; projectName: string }
    >;
