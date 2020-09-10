/* eslint-disable import/prefer-default-export */
import { UpdateUser, UserActions } from '../../models/redux/user';

export function setUserDetails(jwt: string) {
  return {
    type: UserActions.LOAD_USER_DETAILS,
    payload: jwt,
  };
}

export function updateUserDetails(data: UpdateUser) {
  return {
    type: UserActions.UPDATE_USER_DETAILS,
    payload: data,
  };
}

export function userLogout() {
  return {
    type: UserActions.LOGOUT_USER,
    payload: '',
  };
}
