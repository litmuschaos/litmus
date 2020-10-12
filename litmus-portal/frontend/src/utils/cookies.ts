const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

export function setCookie(name: string, value: string, exhours: number) {
  const now = new Date();
  now.setTime(now.getTime() + exhours * HOUR);

  const expires = `expires=${now.toUTCString()}`;

  document.cookie = `${name}=${value};${expires};path=/`;
}

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
