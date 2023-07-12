import type { APIConfig } from '@api/LitmusAPIProvider';

const loc = window.location;
let auth: string;
let chaosManager: string;
let sockURL: string;

if (loc.protocol === 'https:') {
  sockURL = 'wss:';
} else {
  sockURL = 'ws:';
}

if (__DEV__) {
  auth = `/auth`;
  chaosManager = `/api`;
  sockURL += `//${window.location.hostname}:8080`;
} else {
  auth = `${window.location.origin}/auth`;
  chaosManager = `${window.location.origin}/api`;
  sockURL += `//${window.location.host}/ws`;
}

const APIEndpoints: APIConfig = {
  gqlEndpoints: {
    chaosManagerUri: `${chaosManager}/query`,
    sockURL: process.env.GQL_WS_API || `${sockURL}/query`
  },
  restEndpoints: {
    authUri: auth,
    chaosManagerUri: chaosManager
  }
};

export default APIEndpoints;
