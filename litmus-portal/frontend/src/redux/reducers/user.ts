/* eslint-disable @typescript-eslint/no-unused-vars */
import jwtDecode from 'jsonwebtoken';
import { UserAction, UserActions, UserData } from '../../models/user';
import { setCookie } from '../../utils/cookies';
import createReducer from './createReducer';

const initialState: UserData = {
  name: '',
  email: '',
  projectName: '',
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
      console.error('ERROR: ', err);
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
