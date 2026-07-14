import jwt_decode from 'jwt-decode';
import { getUserDetails } from './userDetails';
interface UserDetails {
  role: string;
  uid: string;
  username: string;
  name?: string;
  email?: string;
  exp: Date;
  iat: Date;
}
// Returns the details of a user from jwt token
export function getUserDetailsFromJwt(): UserDetails {
  const { accessToken: token } = getUserDetails();
  const userDetails = jwt_decode(token) as unknown as UserDetails;
  return userDetails;
}
// Returns the username from jwt token
export function getUsername(): string {
  if (getUserDetails().accessToken) return getUserDetailsFromJwt().username;
  return '';
}
// Returns userId from jwt token
export function getUserId(): string {
  if (getUserDetails().accessToken) return getUserDetailsFromJwt().uid;
  return '';
}
// Returns the role of the user from jwt token
export function getUserRole(): string {
  if (getUserDetails().accessToken) return getUserDetailsFromJwt().role;
  return '';
}
// Returns the email of the user from jwt token
export function getUserEmail(): string {
  if (getUserDetails().accessToken) return getUserDetailsFromJwt().email ?? '';
  return '';
}
// Returns the name of the user from jwt token
export function getUserFullName(): string {
  if (getUserDetails().accessToken) return getUserDetailsFromJwt().name ?? '';
  return '';
}

// Checks if the user is  authenticated
export function isUserAuthenticated(): boolean {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const userDetails = getUserDetailsFromJwt();
    const expiry = (new Date(userDetails.exp).getTime() as number) * 1000;
    if (new Date(expiry) > new Date()) return true;
  }
  return false;
}
