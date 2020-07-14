/* eslint-disable import/prefer-default-export */
import jwtdecode from 'jwt-decode';
import { UserActions } from '../../models/user';

export const setUserDetails = (jwt: string) => (dispatch: Function) => {
  dispatch({
    type: UserActions.LOAD_USER_DETAILS,
    payload: jwt,
  });
};
