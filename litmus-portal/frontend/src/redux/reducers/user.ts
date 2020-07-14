/* eslint-disable @typescript-eslint/no-unused-vars */
import jwtDecode from 'jsonwebtoken';
import createReducer from './createReducer';
import { UserData, UserActions, UserAction } from '../../models/user';
import { setCookie } from '../../utils/cookies';

const initialState: UserData = {
  name: '',
  email: '',
  token: '',
  username: '',
  exp: 0,
};

export const userData = createReducer<UserData>(initialState, {
  [UserActions.LOAD_USER_DETAILS](state: UserData, action: UserAction) {
    try {
      const jwt = action.payload as string;
      const data: any = jwtDecode.decode(jwt);
      setCookie('token', jwt, 1);
      return {
        ...state,
        ...data,
        token: jwt,
      };
    } catch (err) {
      console.log('ERROR: ', err);
      return {
        ...state,
      };
    }
  },
  [UserActions.UPDATE_USER_DETAILS](state: UserData, action: UserAction) {
    return {
      ...state,
      ...(action.payload as Object),
    };
  },
  [UserActions.LOGOUT_USER](state: UserData, action: UserAction) {
    return {
      ...initialState,
    };
  },
});

export default userData;
