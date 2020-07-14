export interface UserData {
  name: string;
  email: string;
  username: string;
  exp: number;
  token: string;
}
export enum UserActions {
  LOAD_USER_DETAILS = 'LOAD_USER_DETAILS',
}

interface UserActionType<T, P> {
  type: T;
  payload: P;
}

export type UserAction = UserActionType<
  typeof UserActions.LOAD_USER_DETAILS,
  string
>;
