import type { APIConfig } from '@api/LitmusAPIProvider';

let auth: string;
let chaosManager: string;

if (__DEV__) {
  auth = `/auth`;
  chaosManager = `/api`;
} else {
  auth = `${window.location.origin}/auth`;
  chaosManager = `${window.location.origin}/api`;
}

const APIEndpoints: APIConfig = {
  gqlEndpoints: {
    chaosManagerUri: `${chaosManager}/query`
  },
  restEndpoints: {
    authUri: auth,
    chaosManagerUri: chaosManager
  }
};
export default APIEndpoints;
