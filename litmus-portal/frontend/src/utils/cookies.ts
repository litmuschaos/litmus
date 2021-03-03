import jwtDecode from 'jsonwebtoken';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

interface SetCookieProps {
  name: string;
  value: string;
  exhours: number;
  path?: string;
}
interface SetCookie {
  (props: SetCookieProps): void;
}

// Sets cookie in browser
export const setCookie: SetCookie = ({ name, value, exhours, path }) => {
  const now = new Date();
  now.setTime(now.getTime() + exhours * HOUR);

  const expires = `expires=${now.toUTCString()}`;

  document.cookie = `${name}=${value};${expires};path=${path ?? '/'}`;
};

// Gets cookie in browser
export function getCookie(cname: string): string {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

interface SetJWTTokenProps {
  token: string;
  cookieName: string;
  path?: string;
  errorMessage?: string;
}
interface SetJWTToken {
  (props: SetJWTTokenProps): void;
}

// Sets the JWT token to cookie
export const setJWTToken: SetJWTToken = ({
  token,
  cookieName,
  path,
  errorMessage,
}) => {
  try {
    if (token === undefined || token === null) {
      throw new Error('Token is undefined or null!');
    }
    const data: any = jwtDecode.decode(token);
    const expirationTime = (data.exp - data.iat) / 3600;
    setCookie({
      name: cookieName,
      value: token,
      exhours: expirationTime,
      path,
    });
  } catch (err) {
    console.error(errorMessage ?? 'ERROR IN SETTING COOKIE: ', err);
  }
};

// Gets the JWT token from cookie
export function getJWTToken(cookieName: string): string {
  const jwtToken = getCookie(cookieName);

  if (jwtToken) return jwtToken;

  return '';
}
