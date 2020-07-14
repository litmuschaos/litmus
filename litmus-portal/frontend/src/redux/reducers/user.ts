import jwt_decode from 'jsonwebtoken';
import createReducer from './createReducer';
import { UserData, UserActions, UserAction } from '../../models/user';

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
      let data: any = jwt_decode.decode(action.payload);
      return {
        ...state,
        ...data,
      };
    } catch (err) {
      console.log('ERROR: ', err);
      return {
        ...state,
      };
    }
  },
});

export default userData;
