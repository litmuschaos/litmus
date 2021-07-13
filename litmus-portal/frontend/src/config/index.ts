const loc = window.location;
let sockURL;
let authURL;
let apiURL;
if (loc.protocol === 'https:') {
  sockURL = 'wss:';
} else {
  sockURL = 'ws:';
}
if (
  process.env.NODE_ENV.trim() === 'development' ||
  process.env.NODE_ENV.trim() === 'test'
) {
  authURL = `${window.location.protocol}//${window.location.hostname}:3000`;
  apiURL = `${window.location.protocol}//${window.location.hostname}:8080`;
  sockURL += `//${window.location.hostname}:8080`;
} else {
  authURL = `${process.env.PUBLIC_URL}/auth`;
  apiURL = `${process.env.PUBLIC_URL}/api`;
  sockURL += `//${loc.host}${process.env.PUBLIC_URL}/ws`;
}
export default {
  environment: process.env.NODE_ENV,
  analytics: {
    url:
      process.env.ANALYTICS_API || 'https://hub.litmuschaos.io/api/community',
  },
  auth: {
    url: process.env.AUTH_API || authURL,
  },
  grahqlEndpoint: process.env.GQL_API || apiURL,
  grahqlEndpointSubscription: process.env.GQL_API || sockURL,
};
