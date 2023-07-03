import type { APIConfig } from '@api/LitmusAPIProvider';

let auth: string;
let chaosManager: string;
let sockURL: string;

if (__DEV__) {
  auth = `/auth`;
  chaosManager = `/chaos/manager/api`;
  sockURL = `ws://${window.location.hostname}:8080`;
} else {
  auth = `${window.location.origin}/auth`;
  chaosManager = `${window.location.origin}/gateway/chaos/manager/api`;
  sockURL = `wss://${window.location.host}/chaos/ws`;
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
