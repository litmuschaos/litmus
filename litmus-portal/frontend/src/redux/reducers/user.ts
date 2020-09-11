/* eslint-disable @typescript-eslint/no-unused-vars */
import jwtDecode from 'jsonwebtoken';
import {
  UpdateUser,
  UserAction,
  UserActions,
  UserData,
} from '../../models/redux/user';
import { setCookie } from '../../utils/cookies';
import { history } from '../configureStore';
import createReducer from './createReducer';

const initialState: UserData = {
  selectedProjectID: '',
  username: 'admin',
  selectedProjectName: 'Default',
  userRole: 'Owner',
};

export const userData = createReducer<UserData>(initialState, {
  [UserActions.LOAD_USER_DETAILS](state: UserData, action: UserAction) {
    try {
      const jwt = action.payload as string;
      const data: any = jwtDecode.decode(jwt);
      const expirationTime =
        new Date(data.exp * 1000).getHours() -
        new Date(data.iat * 1000).getHours();

      setCookie('token', jwt, expirationTime);
      return {
        ...state,
        ...data,
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
      ...(action.payload as UpdateUser),
    };
  },
  [UserActions.LOGOUT_USER](state: UserData, action: UserAction) {
    setCookie('token', '', 1);
    history.push('/login');
    return {
      ...initialState,
    };
  },
});

export default userData;
