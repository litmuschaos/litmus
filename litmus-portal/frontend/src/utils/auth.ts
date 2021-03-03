import jwtDecode from 'jsonwebtoken';
import { history } from '../redux/configureStore';
import { getJWTToken, setCookie, setJWTToken } from './cookies';

// Logs out the user and unsets the jwt token
export function logout() {
  setCookie({ name: 'token', value: '', exhours: 1 });
  history.push('/login');
}

// Returns the jwt token
export function getToken(): string {
  const jwtToken = getJWTToken('token');

  // Logout user if jwt is expired
  if (jwtToken === '') {
    logout();
    history.push('/login');
  }

  return jwtToken;
}

// Sets the jwt token in the cookie
export function setUserDetails(token: string) {
  setJWTToken({
    token,
    cookieName: 'token',
    errorMessage: 'ERROR IN SETTING USER DETAILS: ',
  });
}

// Returns the details of a user from jwt token
export function getUserDetailsFromJwt(): any {
  const jwtToken = getToken();
  const userDetails: any = jwtDecode.decode(jwtToken);
  return userDetails;
}

// Returns the username from jwt token
export function getUsername(): string {
  let username = '';
  if (getToken()) username = getUserDetailsFromJwt().username;
  return username;
}

// Returns userId from jwt token
export function getUserId(): string {
  let uuid = '';
  if (getToken()) uuid = getUserDetailsFromJwt().uid;
  return uuid;
}

export function getUserRole(): string {
  let role = '';
  if (getToken()) role = getUserDetailsFromJwt().role;
  return role;
}

export function getUserEmail(): string {
  let email = '';
  if (getToken()) email = getUserDetailsFromJwt().email;
  return email;
}

export function getUserName(): string {
  let name = '';
  if (getToken()) name = getUserDetailsFromJwt().name;
  return name;
}
