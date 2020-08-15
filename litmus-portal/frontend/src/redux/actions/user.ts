/* eslint-disable import/prefer-default-export */
import { UserActions } from '../../models/user';

export const setUserDetails = (jwt: string) => (dispatch: Function) => {
  dispatch({
    type: UserActions.LOAD_USER_DETAILS,
    payload: jwt,
  });
};

export const updateUserDetails = (data: { name: string; email: string }) => (
  dispatch: Function
) => {
  dispatch({
    type: UserActions.UPDATE_USER_DETAILS,
    payload: data,
  });
};

export const userLogout = () => (dispatch: Function) => {
  dispatch({
    type: UserActions.LOGOUT_USER,
    payload: '',
  });
};
