import { UserActions } from '../models/redux/user';
import configureStore from '../redux/configureStore';
import { getCookie } from './cookies';

function getToken(): string {
  const jwtToken = getCookie('token');
  const { store } = configureStore();

  if (jwtToken !== '' && jwtToken !== null && jwtToken !== undefined)
    return jwtToken;

  // Logout user if jwt is expired
  store.dispatch({
    type: UserActions.LOGOUT_USER,
    payload: '',
  });
  return '';
}

export default getToken;
